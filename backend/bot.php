<?php
// This script is called automatically by a cron job every five minutes

// Get MySQL and Bluesky login details
include('secrets.php');

// Get Tracery parser
include('tracery-parser.php');

//
// Connect to MySQL
$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

// Simplified function to send a CURL post request
function fetch( $url, $options = [] ) {
	if (!$url) {
		return;
	}
	$curl = curl_init();

	$headers = [
		'Content-Type: application/json',
		'Accept: application/json'
	];

	if (isset($options['token'])) {
		$headers[] = 'Authorization: Bearer ' . $options['token'];
	}

	$querystring = '';
	$method = 'POST';
	if (isset($options['method']) && $options['method'] == 'GET') {
		$method = 'GET';
		if (isset($options['query'])) {
			$querystring = $options['query'];
		}
	}

	if (isset($options['body'])) {
		$data = $options['body'];
	}

	curl_setopt_array($curl, array(
		CURLOPT_URL => $url . $querystring,
		CURLOPT_RETURNTRANSFER => true,
	  	CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,

		CURLOPT_HTTPHEADER => $headers,
	));

	if ($method === 'POST') {
		// If POST (for now, let's assume it's always POST)
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
	}

	$response = curl_exec($curl);
	
	curl_close($curl);
	return json_decode( $response, true );
}

// Create ATProto session
function atproto_create_session($provider, $identifier, $password) {

	if (!$provider) {
		$provider = 'https://bsky.social';
	}

	$res = fetch($provider . '/xrpc/com.atproto.server.createSession', [
		'body' => [
			'identifier' => $identifier,
			'password' => $password,
		], 
	]);	

	return $res;
}

function post_bsky_thread($text, $session, $options = []) {
	$domain = 'https://bsky.social';
	if (isset($options['domain']) && $options['domain']) {
		$domain = $options['domain'];
	}

	// Split text in 300 character chunks
	$texts = [];
	while ($text) {
		if (strlen($text) > 300) {
			$length = strrpos( substr($text, 0, 300), ' ' );
			$texts[] = substr($text, 0, $length);
			$text = trim(substr($text, $length));
		}
		else {
			$texts[] = $text;
			$text = '';
		}
	}

	$texts_length = count($texts);

	$root = isset($options['root']) ? $options['root'] : [];
	$parent = isset($options['parent']) ? $options['parent'] : [];

	date_default_timezone_set('UTC');

	// For each chunk of text ...
	for ($i = 0; $i < $texts_length; $i++) {

		// Set a timestamp
		$ms = microtime();
		$ms_arr1 = explode(' ', $ms);
		$ms_arr2 = explode('.', $ms_arr1[0]);
		$timestamp = date('Y-m-d\TH:i:s.') . $ms_arr2[1] . 'Z';

		// Create a record
		$record = [
			'$type' => 'app.bsky.feed.post',
			'createdAt' => $timestamp,
			'text' => $texts[$i],
		];
		if (isset($option['language']) && $option['language']) {
			$record['langs'] = [ $option['language'] ];
		}

		// Add post to thread
		if ($i > 0 || count($root) > 0) {
			$record['reply'] = [
				'root' => $root,
				'parent' => $parent,
			];
		}

		// Post to Bluesky
		$result2 = fetch(  $domain . '/xrpc/com.atproto.repo.createRecord', [
			'body' => [
				'repo' => $session['did'],
				'collection' => 'app.bsky.feed.post',
				'record' => $record,
			],
			'token' => $session['accessJwt'],
		] );

		// Set root and parent for the next posts
		if ($i === 0 && $root == []) {
			$root = $result2;
		}
		$parent = $result2;
	}
}

// The function that is called when the bot runs
function run_bot() {
	global $conn;

	$post_length = 300;

	// Get bots
	$query = 'SELECT id, domain, identifier, password, script, msg, actionIfLong, language FROM bbdq WHERE active = 1 AND TIMESTAMPDIFF(MINUTE, lastPost, NOW()) >= minutesBetweenPosts';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	// Finish if no such people 
	if (!$result->num_rows) {
		return;
	}

	while ($row = $result->fetch_assoc()) {
		$tracery = new Tracery;
		$tracery_code = json_decode($row['script'], true);
		
		if (!$tracery_code || !is_array($tracery_code) || !isset($tracery_code[$row['msg']])) {
			// Invalid tracery code
			continue;
		}
		$grammar = $tracery->createGrammar($tracery_code);
		$grammar->addModifiers($tracery->baseEngModifiers());

		$text = '';
		for ($i = 0; $i < 10; $i++) {
			$generated_text = $grammar->flatten('#' . $row['msg'] . '#');
			if (strlen($generated_text) <= $post_length || $row['actionIfLong'] == 1) {
				$text = $generated_text;
				break;
			}
		}
		if (!$text) {
			// Couldn't generate string shorter than 300 characters
			continue;
		}
		$domain = $row['domain'] ? $row['domain'] : 'https://bsky.social';
		$session = atproto_create_session($row['domain'], $row['identifier'], $row['password']);
		if (isset($session['error'])) {
			// Wrong bluesky username/password
			continue;
		}

		// Update database
		$query = 'UPDATE bbdq SET lastPost = NOW(), lastPostText = ? WHERE id = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('si', $text, $row['id']);
		$stmt->execute();
		$stmt->close();

		// Post thread
		post_bsky_thread($text, $session, [
			'domain' => $row['domain'],
			'language' => $row['language'],
		]);
	}	
}

function check_replies() {
	global $conn;
	$post_length = 300;

	// Get all active bots
	$query = 'SELECT id, domain, identifier, password, script, reply, actionIfLong, language, lastNotification FROM bbdq WHERE active = 1';
	$stmt = $conn->prepare($query);
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
		$domain = $row['domain'] ? $row['domain'] : 'https://bsky.social';
		$session = atproto_create_session($domain, $row['identifier'], $row['password']);

		// Get new notifications
		$notifications = [];
		do {
			$notifications_result = fetch(  $domain . '/xrpc/app.bsky.notification.listNotifications', [
				'method' => 'GET',
				'querystring' => '?limit=10',
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
		if (count($replies) > 0) {
			// Update database
			$new_last_notification = $notifications[0]['indexedAt'];
			$query = 'UPDATE bbdq SET lastNotification = ? WHERE id = ?';
			$stmt = $conn->prepare($query);
			$stmt->bind_param('si', $new_last_notification, $row['id']);
			$stmt->execute();
			$stmt->close();
			
			// There are new messages to reply to
			$grammar = $tracery->createGrammar($tracery_code);
			$grammar->addModifiers($tracery->baseEngModifiers());
	
			foreach ($replies as $reply) {
				$text = '';
				for ($i = 0; $i < 10; $i++) {
					$generated_text = $grammar->flatten('#' . $row['reply'] . '#');
					if (strlen($generated_text) <= $post_length || $row['actionIfLong'] == 1) {
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
					'domain' => $row['domain'],
					'language' => $row['language'],
					'parent' => $reply['parent'],
					'root' => $reply['root'],
				]);

			}
		}

	}	
}

// run_bot();
check_replies();