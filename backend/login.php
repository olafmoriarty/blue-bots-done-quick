<?php
method_check(['GET', 'POST']);
parameter_check($body, ['identifier', 'password']);

// Check if user exists
$query = 'SELECT password, iv, active, provider, identifier, script, language, minutesBetweenPosts, msg, reply, actionIfLong, showSource FROM bbdq WHERE identifier = ?';
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $body['identifier']);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

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
		$encrypted_password = openssl_encrypt( $body['password'], 'aes-256-cbc', $encryption_key, 0, $iv );

		$query = 'UPDATE bbdq SET password = ?, iv = ? WHERE identifier = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('sss', $encrypted_password, $iv_hex, $body['identifier']);
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
	$provider = 'https://bsky.social';
	if (isset($body['provider'])) {
		$provider = $body['provider'];
	}

	$session = atproto_create_session($provider, $body['identifier'], $body['password']);
	if (isset($session['error'])) {
		// Couldn't authenticate user AT ALL
		return_error('WRONG_USERNAME_OR_PASSWORD', '401');
	}
	else {
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
			$stmt->bind_param( $session['handle'], $encrypted_password, $iv_hex, $row['id']);
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
		$query = 'SELECT active, provider, identifier, script, language, minutesBetweenPosts, msg, reply, actionIfLong, showSource FROM bbdq WHERE id = ?';
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