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
	$timezone = ini_get('date.timezone');

	// Get bots
	$query = 'SELECT id, provider, script, msg, actionIfLong, language, n_value, autopostMode, autopostTimes, nextPostContents FROM bbdq WHERE active = 1 AND minutesBetweenPosts > 0 AND ((autopostMode = 0 AND TIMESTAMPDIFF(MINUTE, lastPost, NOW()) >= minutesBetweenPosts - 4) OR (autopostMode = 1 AND NOW() >= nextPost)) ORDER BY minutesBetweenPosts DESC, followers DESC;';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	// Finish if no such people 
	if (!$result->num_rows) {
		return;
	}

	$start_timestamp = date('d.m.Y H:i:s');
	$start_time = microtime( true );

	while ($row = $result->fetch_assoc()) {
		if ($row['autopostMode'] === 1 && $row['nextPostContents']) {
			$generated = generate_post($row['script'], '', $row['actionIfLong'] ? 0 : $post_length, $row['n_value'], $row['nextPostContents']);
		}
		else {
			$generated = generate_post($row['script'], $row['msg'], $row['actionIfLong'] ? 0 : $post_length, $row['n_value']);
		}

		// Check that the message hasn't already been sent to avoid double-posting
		$query = 'SELECT id FROM bbdq WHERE active = 1 AND minutesBetweenPosts > 0 AND ((autopostMode = 0 AND TIMESTAMPDIFF(MINUTE, lastPost, NOW()) >= minutesBetweenPosts - 4) OR (autopostMode = 1 AND NOW() >= nextPost)) AND id = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('i', $row['id']);
		$stmt->execute();
		$timecheck_result = $stmt->get_result();
		$stmt->close();
	
		// If this query has no rows, it most likely means that a post is already posted since after $result was generated, in which case don't post again! 
		if (!$timecheck_result->num_rows) {
			continue;
		}
	

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
		$gnd = null;
		if ($row['autopostMode'] === 1) {
			$gnd = get_next_datetime($row['autopostTimes']);
			if ($gnd) {
				$query .= ', nextPost = ?, nextPostContents = ?, minutesBetweenPosts = ?';
				date_default_timezone_set($timezone);
				$nextPost = date('Y-m-d H:i:s', $gnd['timestamp']);
			}
		}
		$query .= ' WHERE id = ?';
		$stmt = $conn->prepare($query);
		if ($gnd) {
			$stmt->bind_param('sssii', $text, $nextPost, $gnd['rule'], $gnd['minutesBetweenPosts'], $row['id']);
		}
		else {
			$stmt->bind_param('si', $text, $row['id']);
		}
		$stmt->execute();
		$stmt->close();

		// Post thread
		post_bsky_thread($text, $session, [
			'provider' => $provider,
			'language' => $row['language'],
		]);

	}	
	$end_time = microtime( true );
	$diff = $end_time - $start_time;
	error_log( 'Job initiated ' . $start_timestamp . ' completed in ' . $diff . ' seconds');
}

run_bot();
