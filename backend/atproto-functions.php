<?php
include('atproto-rich-text.php');

// Create ATProto session
function atproto_create_session($provider, $identifier, $password) {
	if (!$provider) {
		$provider = 'https://bsky.social';
	}

	return fetch( $provider . '/xrpc/com.atproto.server.createSession', [
		'body' => [
			'identifier' => $identifier,
			'password' => $password,
		],
	]);
}

function atproto_session($conn, $encryption_key, $id) {
	$query = 'SELECT id, provider, did, password, iv, accessJwt, TIMESTAMPDIFF(MINUTE, NOW(), IFNULL(accessJwt_time, \'2000-01-01\')) as accessJwt_time_left, refreshJwt, TIMESTAMPDIFF(MINUTE, NOW(), IFNULL(refreshJwt_time, \'2000-01-01\')) as refreshJwt_time_left FROM bbdq WHERE id = ?';
	
	$stmt = $conn->prepare($query);
	$stmt->bind_param('i', $id);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	if (!$result->num_rows) {
		return ['error' => 'NO_SUCH_USER'];
	}

	$row = $result->fetch_assoc();

	// Is the access token still valid?
	if ($row['accessJwt_time_left'] > 5) {
		$access_token = openssl_decrypt($row['accessJwt'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));

		return [
			'accessJwt' => $access_token,
			'did' => $row['did'],
		];
	}

	// If not, do we have a valid refresh token?

	$provider = $row['provider'];
	if (!$provider) {
		$provider = 'https://bsky.social';
	}

	if ($row['refreshJwt_time_left'] > 5) {
		$refresh_token = openssl_decrypt($row['refreshJwt'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));

		// Fetch a new access token
		$session = fetch( $provider . '/xrpc/com.atproto.server.refreshSession', [
			'token' => $refresh_token,
		]);

		if (isset($session['accessJwt'])) {
			// Save new token to database ...

			// TODO: Check headers for token lifespan instead of assuming two hours
			$encrypted_access_token = openssl_encrypt($session['accessJwt'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));
			$query = 'UPDATE bbdq SET accessJwt = ?, accessJwt_time = DATE_ADD(NOW(), INTERVAL 2 HOUR) WHERE id = ?';
			$stmt = $conn->prepare($query);
			$stmt->bind_param('si', $encrypted_access_token, $id);
			$stmt->execute();
			$stmt->close();

			// Return the session
			return $session;
		}
	}

	// No valid tokens found, so let's create a new one.
	$password = openssl_decrypt($row['password'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));

	$session = fetch( $provider . '/xrpc/com.atproto.server.createSession', [
		'body' => [
			'identifier' => $row['did'],
			'password' => $password,
		],
	]);
	
	if (isset($session['accessJwt'])) {
		// Save new tokens to database ...

		// TODO: Check headers for token lifespan instead of assuming two hours / two months
		$encrypted_access_token = openssl_encrypt($session['accessJwt'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));
		$encrypted_refresh_token = openssl_encrypt($session['refreshJwt'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));
		$query = 'UPDATE bbdq SET accessJwt = ?, accessJwt_time = DATE_ADD(NOW(), INTERVAL 2 HOUR), refreshJwt = ?, refreshJwt_time = DATE_ADD(NOW(), INTERVAL 58 DAY) WHERE id = ?';
		$stmt = $conn->prepare($query);
		$stmt->bind_param('ssi', $encrypted_access_token, $encrypted_refresh_token, $id);
		$stmt->execute();
		$stmt->close();

		// Return the session
		return $session;
	}

	// Nothing worked :-(
	return [
		'error' => 'Could not create session.',
	];
}

// Post thread to bluesky
function post_bsky_thread($text, $session, $options = []) {
	
	$provider = empty($options['provider']) ? 'https://bsky.social' : $options['provider'];

	// Check text for image tags
	$regex = "/\{img[  ](https?:\/\/[^  }]+)[  ]?([^}]*)}/";
	preg_match_all( $regex, $text, $matches );
	$image_links = array_slice($matches[1], 0, 4);
	$image_count = count($image_links);
	$blobs = [];
	if ($image_count) {
		$text = preg_replace( $regex, '', $text );
		if (!strlen($text)) {
			$text = ' ';
		}
		foreach ($image_links as $key => $url) {
			$data = upload_blob_from_url($url, $provider, $session['accessJwt']);
			if ($data && isset($data['blob'])) {
				$blobs[] = [
					'blob' => $data["blob"],
					'alt' => $matches[2][$key],
				];
			}
		}
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

	$root = $options['root'] ?? [];
	$parent = $options['parent'] ?? [];

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

		// Add rich text facets
		$facets = detectFacets($texts[$i]);
		if ($facets) {
			$facet_count = count($facets);
			for ($f = 0; $f < $facet_count; $f++) {
				if ($facets[$f]['features'][0]['$type'] === 'app.bsky.richtext.facet#mention') {
					$handle = $facets[$f]['features'][0]['did'];

					$profile = fetch(  $provider . '/xrpc/app.bsky.actor.getProfile', [
						'method' => 'GET',
						'query' => '?actor=' . $handle,
						'token' => $session['accessJwt'],
					] );
					if (isset($profile['did'])) {
						$facets[$f]['features'][0]['did'] = $profile['did'];
					}
				}
			}
			$record['facets'] = $facets;
		}

		// Add post to thread
		if ($i > 0 || count($root) > 0) {
			$record['reply'] = [
				'root' => $root,
				'parent' => $parent,
			];
		}

		if ($i === 0 && count($blobs)) {
			$images = [];
			foreach ($blobs as $blob) {
				$images[] = [ "image" => $blob['blob'], "alt" => $blob['alt'] ];
			}
			$record['embed'] = [
				'$type' => 'app.bsky.embed.images',
				'images' => $images, 
			];
		}

		// Post to Bluesky
		$result2 = fetch(  $provider . '/xrpc/com.atproto.repo.createRecord', [
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

function upload_blob_from_url( $url, $provider, $token ) {
	// Get file
	if (!$url || !$provider || !$token) {
		return;
	}

	try {
		$curl = curl_init();

		curl_setopt_array($curl, array(
			CURLOPT_URL => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => '',
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 0,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		));

		curl_setopt($curl, CURLOPT_HTTPGET, true);

		$image = curl_exec($curl);
		$content_type = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

		// Upload it to bsky
		$curl = curl_init();

		$headers = [
			'Content-Type: ' . $content_type,
			'Accept: application/json',
			'Authorization: Bearer ' . $token
		];

		if (isset($options['body'])) {
			$data = $image;
		}

		curl_setopt_array($curl, array(
			CURLOPT_URL => $provider . '/xrpc/com.atproto.repo.uploadBlob',
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => '',
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 0,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,

			CURLOPT_HTTPHEADER => $headers,
		));

		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $image);

		$response = curl_exec($curl);
		
		curl_close($curl);
		return json_decode( $response, true );
	}
	catch ( Exception $e ) {
		return;
	}
}
