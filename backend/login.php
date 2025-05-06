<?php
global $encryption_key, $conn, $body;
method_check(['POST']);
parameter_check($body, ['identifier', 'password']);

// Check provider, identifier and password
$provider = empty($body['provider']) ? 'https://bsky.social' : $body['provider'];

if (!str_contains($provider, '://')) {
	return_error('PROVIDER_PROTOCOL_MISSING');
}

if (str_starts_with($body['identifier'], '@')) {
	$body['identifier'] = substr($body['identifier'], 1);
}

// Check if user exists

if ($provider === 'https://bsky.social') {
	$query = 'SELECT id, password, iv, active, provider, identifier, script, replyMode, replyScript, language, minutesBetweenPosts, msg, reply, actionIfLong, showSource, name, thumb FROM bbdq WHERE identifier = ? AND provider LIKE "%bsky%"';
	$stmt = $conn->prepare($query);
	$stmt->bind_param('s', $body['identifier']);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
}
else {
	$query = 'SELECT id, password, iv, active, provider, identifier, script, replyMode, replyScript, language, minutesBetweenPosts, msg, reply, actionIfLong, showSource, name, thumb FROM bbdq WHERE identifier = ? AND provider = ?';
	$stmt = $conn->prepare($query);
	$stmt->bind_param('ss', $body['identifier'], $provider);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
}

if ($result->num_rows) {
	// Check if password is correct
	$row = $result->fetch_assoc();
	$data = $row;
	$password = openssl_decrypt($row['password'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));
	if ($password !== $body['password']) {
		// Double-check against bsky in case password has changed
		$session = atproto_create_session($provider, $body['identifier'], $body['password']);
		if (isset($session['error'])) {
			// Nope, can't authenticate there either
			return_error('WRONG_USERNAME_OR_PASSWORD', '401');
		}
		// Ah, our locally stored password is wrong! We should update it and carry on, then.
		$iv = openssl_random_pseudo_bytes(16);
		$iv_hex = bin2hex($iv);
		$encrypted_password = openssl_encrypt($body['password'], 'aes-256-cbc', $encryption_key, 0, $iv);

		$query = 'UPDATE bbdq SET password = ?, iv = ?, accessJwt = null, accessJwt_time = null, refreshJwt = null, refreshJwt_time = null WHERE id = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('ssi', $encrypted_password, $iv_hex, $row['id']);
		$stmt->execute();
		$stmt->close();
	}

	// User authenticated, return data
	$data = values_to_boolean($data, ['active', 'actionIfLong', 'showSource']);
	unset($data['password']);
	unset($data['iv']);
	$c = [
		'data' => $data
	];
	return_json($c);

}
else {
	// User is not in database, check if they exist on Bluesky
	$session = atproto_create_session($provider, $body['identifier'], $body['password']);
	if (isset($session['error'])) {
		// Couldn't authenticate user AT ALL
		return_error('WRONG_USERNAME_OR_PASSWORD', '401');
	}
	else {
		// In case user tried logging in with email or DID (even though we specifically told them to use the handle!), fix that
		if ($body['identifier'] !== $session['handle']) {
			$body['identifier'] = $session['handle'];
		}

		// Encrypt password
		$iv = openssl_random_pseudo_bytes(16);
		$iv_hex = bin2hex($iv);
		$encrypted_password = openssl_encrypt( $body['password'], 'aes-256-cbc', $encryption_key, 0, $iv );

		// Double-check if DID already exists
		$query = 'SELECT id FROM bbdq WHERE did = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('s', $session['did']);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();
		
		$id = 0;

		if ($result->num_rows) {
			$row = $result->fetch_assoc();
			$id = $row['id'];

			// User DOES exist! That must mean the user IS registered, but has a new handle. So we'll just update it..
			$query = 'UPDATE bbdq SET identifier = ?, password = ?, iv = ? WHERE id = ?';
			$stmt = $conn->prepare($query);
			$stmt->bind_param('sssi', $session['handle'], $encrypted_password, $iv_hex, $row['id']);
			$stmt->execute();
			$stmt->close();
		}
		else {
			// Create user!
			$query = 'INSERT INTO bbdq (provider, did, identifier, password, iv) VALUES (?, ?, ?, ?, ?)';
			$stmt = $conn->prepare($query);
			$stmt->bind_param('sssss', $provider, $session['did'], $body['identifier'], $encrypted_password, $iv_hex);
			$stmt->execute();
			$stmt->close();

			$id = $conn->insert_id;
		}

		// Get return values from database
		$query = 'SELECT active, provider, identifier, script, replyMode, replyScript, language, minutesBetweenPosts, msg, reply, actionIfLong, showSource, name, thumb FROM bbdq WHERE id = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('i', $id);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();

		$data = $result->fetch_assoc();
		$data = values_to_boolean($data, ['active', 'actionIfLong', 'showSource']);
		$c = [
			'data' => $data
		];

		return_json($c);
	}
}

return_json([]);