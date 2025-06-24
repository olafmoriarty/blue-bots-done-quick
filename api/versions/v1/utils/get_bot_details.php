<?php

function get_bot_details( $conn, $id, $full = false ) {
	$query = 'SELECT name, did, identifier, lastPostText, thumb, script, showSource, followers, activeSince';
	if ($full) {
		$query .= ', active, provider, replyMode, replyScript, language, minutesBetweenPosts, msg, reply, autopostMode, autopostTimes, actionIfLong, hideOnBotList'; 
	}
	$query .= ' FROM bbdq WHERE ';
	$query .= is_numeric($id) ? 'id' : 'identifier';
	$query .= ' = ?';
	if (!$full) {
		$query .= ' AND active = 1 AND hideOnBotList = 0';
	}
	$stmt = $conn->prepare($query);
	$stmt->bind_param(is_numeric($id) ? 'i' : 's', $id);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	if (!$result->num_rows) {
		return;
	}

	$data = $result->fetch_assoc();
	$data = values_to_boolean($data, ['active', 'actionIfLong', 'showSource', 'hideOnBotList']);
	if ($full && $data['autopostMode'] === 1) {
		$data['minutesBetweenPosts'] = 720;
	}
	return $data;
}