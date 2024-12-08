<?php
// This script is called automatically by a cron job every five minutes

// Get MySQL and Bluesky login details
global $mysql_host, $mysql_user, $mysql_pass, $mysql_db;
include('secrets.php');

// Get fetch function
include('functions.php');

// Get generate_post function
include('generate.php');

// Connect to MySQL
$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

// The function that is called when the bot runs
function run_bot() {
	global $conn;
	global $encryption_key;

	$post_length = 300;
	// Get bots
	$query = 'SELECT id, provider, script, msg, actionIfLong, language, n_value FROM bbdq WHERE active = 1 AND minutesBetweenPosts > 0 AND TIMESTAMPDIFF(MINUTE, lastPost, NOW()) >= minutesBetweenPosts - 2';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	// Finish if no such people 
	if (!$result->num_rows) {
		return;
	}

	while ($row = $result->fetch_assoc()) {
		$generated = generate_post($row['script'], $row['msg'], $row['actionIfLong'] ? 0 : $post_length, $row['n_value']);

		$text = '';
		if (isset($generated) && $generated && isset($generated['text'])) {
			$text = $generated['text'];
		}
		if (!$text) {
			// Couldn't generate string shorter than 300 characters
			continue;
		}
		$provider = $row['provider'] ?: 'https://bsky.social';
		$session = atproto_session($conn, $encryption_key, $row['id']);
		if (isset($session['error'])) {
			// Wrong bluesky username/password
			continue;
		}

		// Update database
		$query = 'UPDATE bbdq SET lastPost = NOW(), lastPostText = ?';
		if ($generated['increase_n']) {
			$query .= ', n_value = n_value + 1';
		}
		$query .= ' WHERE id = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('si', $text, $row['id']);
		$stmt->execute();
		$stmt->close();

		// Post thread
		post_bsky_thread($text, $session, [
			'provider' => $provider,
			'language' => $row['language'],
		]);
	}	
}

run_bot();