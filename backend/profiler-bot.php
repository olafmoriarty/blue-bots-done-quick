<?php
// This script is called automatically by a cron job every 24 hours

// Get MySQL and Bluesky login details
include('secrets.php');
// Get fetch function
include('functions.php');

// Connect to MySQL
$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

// The function that is called when the bot runs
function get_profiles() {
	global $conn, $bbdq_bluesky_handle, $bbdq_bluesky_password;

	// Get all identifiers
	$query = 'SELECT did FROM bbdq';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	$actors = [];
	while ($row = $result->fetch_assoc()) {
		$actors[] = $row['did'];
	}

	$actor_count = count($actors);

	if (!$actor_count) {
		return;
	}

	$session = atproto_create_session('https://bsky.social', $bbdq_bluesky_handle, $bbdq_bluesky_password);

	for ($i = 0; $i < $actor_count; $i = $i + 25) {
		$actors_slice = array_slice($actors, $i, 25);
		$query_string = '?actors=' . implode('&actors=', $actors_slice);
		$res = fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles', [
			'method' => 'GET',
			'query' => $query_string,
			'token' => $session['accessJwt'],
		]);

		foreach ($res['profiles'] as $profile) {
			$avatar = isset($profile['avatar']) ? $profile['avatar'] : '';
			$displayName = isset($profile['displayName']) ? $profile['displayName'] : '';
			$query = 'UPDATE bbdq SET name = ?, thumb = ?, followers = ? WHERE did = ?';
			$stmt = $conn->prepare($query);
			$stmt->bind_param('ssis', $displayName, $avatar, $profile['followersCount'], $profile['did']);
			$stmt->execute();
			$stmt->close();
		}

		print_r($res);
	}

}

get_profiles();