<?php
global $body, $conn, $encryption_key;
method_check(['DELETE']);

// Check if there's a valid access token
if (!$auth_result['success']) {
	return_error($auth_result['error'], '401');
}
// Check that that access token covers this particular bot
if (!in_array($id, $ids)) {
	return_error('NOT_AUTHORIZED_TO_EDIT_THIS_BOT', '403');
}

// Okay, let's delete the bot
$query = 'DELETE FROM bbdq WHERE id = ?';
$stmt = $conn->prepare($query);
$stmt->bind_param('i', $row['id']);
$stmt->execute();
$stmt->close();

return_json([]);