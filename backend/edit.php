<?php
method_check(['PATCH']);
parameter_check($body, ['identifier', 'password']);

// Check provider, identifier and password
$provider = 'https://bsky.social';
if (isset($body['provider']) && $body['provider']) {
	$provider = $body['provider'];
}

if (strpos($provider, '://') === false) {
	return_error('PROVIDER_PROTOCOL_MISSING');
}

if (substr($body['identifier'], 0, 1) === '@') {
	$body['identifier'] = substr($body['identifier'], 1);
}

// Get user
$query = 'SELECT password, iv, script, msg, reply, activeSince FROM bbdq WHERE identifier = ? AND provider = ?';
$stmt = $conn->prepare($query);
$stmt->bind_param('ss', $body['identifier'], $provider);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

if (!$result->num_rows) {
	// Username does not exist.
	return_error('WRONG_USERNAME_OR_PASSWORD', '401');
}

// Username exists, check if password is correct
$row = $result->fetch_assoc();
$password = openssl_decrypt($row['password'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));
if ($password !== $body['password']) {
	// Wrong password
	return_error('WRONG_USERNAME_OR_PASSWORD', '401');
}

// Start processing information that should be updated in the database
// Check if the tracery code appears to be valid
$script = isset($body['script']) ? $body['script'] : $row['script'];
$script = json_decode($script, true);
if (!$script || !is_array($script)) {
	return_error('INVALID_JSON');
}

// Check if the selected rules for post and reply actually exist
$rule = isset($body['msg']) ? $body['msg'] : $row['msg'];
if (!$rule || !isset($script[$rule])) {
	return_error('ORIGIN_RULE_MISSING');
}

// Check if the selected rules for post and reply actually exist
$rule = isset($body['reply']) ? $body['reply'] : $row['reply'];
if (!$rule || !isset($script[$rule])) {
	return_error('REPLY_RULE_MISSING');
}

// If minutesBetweenPosts is given, check if it's a number
if (isset($body['minutesBetweenPosts']) && !is_int($body['minutesBetweenPosts']) && !is_numeric($body['minutesBetweenPosts'])) {
	return_error('MINUTES_NOT_A_NUMBER');
}

// All data appears to be valid, update database!

$fields_to_update = [];
$new_values = [];
$bind_param_string = '';

$possible_fields = ['script', 'msg', 'reply', 'minutesBetweenPosts', 'language', 'active', 'actionIfLong', 'showSource'];
$ints = ['minutesBetweenPosts'];
$bools = ['active', 'actionIfLong', 'showSource'];

foreach ($possible_fields as $field) {
	if (isset($body[$field])) {
		$fields_to_update[] = $field;
		$new_values[] = in_array($field, $bools) ? ($body[$field] ? 1 : 0) :  $body[$field];
		$bind_param_string .= (in_array($field, $ints) || in_array($field, $bools) ? 'i' : 's');
	}
}


if (count($fields_to_update)) {
	$query = 'UPDATE bbdq SET ' . implode(' = ?, ', $fields_to_update) . ' = ?';
	if (isset($body['active']) && $body['active'] && !$row['activeSince']) {
		$query .= ', activeSince = NOW(), lastNotification = REPLACE(NOW(), " ", "T")';
	}
	$query .= ' WHERE identifier = ? AND provider = ?';
	$bind_param_string .= 'ss';
	$new_values[] = $body['identifier'];
	$new_values[] = $provider;

	$stmt = $conn->prepare($query);
	$stmt->bind_param($bind_param_string, ...$new_values);
	$stmt->execute();
	$stmt->close();
}

return_json([]);