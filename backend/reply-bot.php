<?php
// This script is called automatically by a cron job every five minutes

// Get MySQL and Bluesky login details
global $mysql_host, $mysql_user, $mysql_pass, $mysql_db;
include('secrets.php');

// Get fetch function
include('functions.php');

// Get Tracery parser
include('tracery-parser.php');

// Connect to MySQL
$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

function check_replies() {
	$letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	
	$letter = '';
	// Check if there's a command line variable
	if (isset($_SERVER['argv']) && isset($_SERVER['argv'][1]) && is_numeric($_SERVER['argv'][1])) {
		$letter = substr($letters, $_SERVER['argv'][1] - 1, 1);
	}
	global $conn;
	global $encryption_key;
	$post_length = 300;

	// Update timestamp for all non-replying bots so that if they start replying at some point they won't post replies for the past ten years of replies
	$new_last_notification = $notifications[0]['indexedAt'];
	$query = 'UPDATE bbdq SET lastNotification = REPLACE(UTC_TIMESTAMP(), " ", "T") WHERE active = 1 AND reply = ""';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$stmt->close();

	// Get all active bots that should reply
	$query = 'SELECT identifier, id, provider, script, reply, actionIfLong, language, lastNotification FROM bbdq WHERE active = 1 AND reply != ""';
	if ($letter) {
		$query .= ' AND SUBSTRING(did, 9, 1) = ?';
	}
	$stmt = $conn->prepare($query);
	if ($letter) {
		$stmt->bind_param('s', $letter);
	}
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	// Finish if no active bots 
	if (!$result->num_rows) {
		return;
	}

	// For each bot
	while ($row = $result->fetch_assoc()) {
		$tracery = new Tracery;
		$tracery_code = json_decode($row['script'], true);
		
		if (!$tracery_code || !is_array($tracery_code) || !isset($tracery_code[$row['reply']])) {
			// Invalid tracery code
			continue;
		}

		// Check for new replies
		$provider = $row['provider'] ?: 'https://bsky.social';

		$session = atproto_session($conn, $encryption_key, $row['id']);
		if (isset($session['error'])) {
			// Wrong bluesky username/password
			continue;
		}

		// Get new notifications
		$notifications = [];
		$cursor = '';
		do {
			$queryString = '?limit=10';
			if ($cursor) {
				$queryString .= '&cursor=' . $cursor;
			}
		
			$notifications_result = fetch(  $provider . '/xrpc/app.bsky.notification.listNotifications', [
				'method' => 'GET',
				'query' => $queryString,
				'token' => $session['accessJwt'],
			] );
			$notifications = array_merge($notifications, $notifications_result['notifications']);

			$cursor = '';
			if (isset($notifications_result['cursor'])) {
				$cursor = $notifications_result['cursor'];
			}
		}
		while ($cursor > $row['lastNotification']);

		// Filter out replies and mentions
		$replies = [];
		$notification_count = count($notifications);
		for ($i = 0; $i < $notification_count; $i++) {
			$notif = $notifications[$i];
			if ($notif['indexedAt'] <= $row['lastNotification']) {
				continue;
			}
			if ($notif['reason'] === 'reply') {
				$parent = [
					'uri' => $notif['uri'],
					'cid' => $notif['cid']
				];
				$root = $notif['record']['reply']['root'];
				$replies[] = [
					'parent' => $parent,
					'root' => $root,
				];
			}
			elseif ($notif['reason'] === 'mention') {
				$parent = [
					'uri' => $notif['uri'],
					'cid' => $notif['cid']
				];
				$root = $parent;
				if (isset($notif['record']['reply'])) {
					$root = $notif['record']['reply']['root'];
				}
				$replies[] = [
					'parent' => $parent,
					'root' => $root,
				];
			}
		}

		if ($notification_count && $notifications[0]['indexedAt'] > $row['lastNotification']) {
			// Update database
			$new_last_notification = $notifications[0]['indexedAt'];
			$query = 'UPDATE bbdq SET lastNotification = ? WHERE id = ?';
			$stmt = $conn->prepare($query);
			$stmt->bind_param('si', $new_last_notification, $row['id']);
			$stmt->execute();
			$stmt->close();
		}
		if (count($replies) > 0) {
			// There are new messages to reply to
			$grammar = $tracery->createGrammar($tracery_code);
			$grammar->addModifiers($tracery->baseEngModifiers());
	
			foreach ($replies as $reply) {
				$text = '';
				$possible_tags = ['img', 'svg', 'alt'];
				$regex = '/\{(' . implode('|', $possible_tags) . ')(?:[  ]((?:[^}]|(?<=\\\\)})*))?}/';
				
				for ($i = 0; $i < 10; $i++) {
					$generated_text = $grammar->flatten('#' . $row['reply'] . '#');
					if (strlen(preg_replace( $regex, '', $generated_text )) <= $post_length || $row['actionIfLong'] == 1) {
						$text = $generated_text;
						break;
					}
				}
				if (!$text) {
					// Couldn't generate string shorter than 300 characters
					continue;
				}

				// Post thread
				post_bsky_thread($text, $session, [
					'provider' => $provider,
					'language' => $row['language'],
					'parent' => $reply['parent'],
					'root' => $reply['root'],
				]);

			}
		}

	}
	
}
// REPLACE(UTC_TIMESTAMP(), " ", "T")
check_replies();