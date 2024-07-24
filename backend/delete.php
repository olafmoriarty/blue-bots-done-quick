<?php
global $body, $conn, $encryption_key;
method_check(['DELETE']);
parameter_check($body, ['identifier', 'password']);

// Check provider, identifier and password
$provider = $body['provider'] ?? 'https://bsky.social';

if (!str_contains($provider, '://')) {
	return_error('PROVIDER_PROTOCOL_MISSING');
}

if (str_starts_with($body['identifier'], '@')) {
	$body['identifier'] = substr($body['identifier'], 1);
}

// Get user
$query = 'SELECT id, password, iv FROM bbdq WHERE identifier = ? AND provider = ?';
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

// Okay, let's delete the bot
$query = 'DELETE FROM bbdq WHERE id = ?';
$stmt = $conn->prepare($query);
$stmt->bind_param('i', $row['id']);
$stmt->execute();
$stmt->close();

return_json([]);