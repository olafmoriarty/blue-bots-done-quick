<?php
// This script is called automatically by a cron job every 24 hours

// Get MySQL and Bluesky login details
global $mysql_host, $mysql_user, $mysql_pass, $mysql_db;
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

function saveProfile(mixed $profile, false|mysqli $conn): void {
	$avatar      = $profile['avatar'] ?? '';
	$displayName = $profile['displayName'] ?? '';
	$query       = 'UPDATE bbdq SET name = ?, thumb = ?, followers = ? WHERE did = ?';
	$stmt        = $conn->prepare($query);
	$stmt->bind_param('ssis', $displayName, $avatar, $profile['followersCount'], $profile['did']);
	$stmt->execute();
	$stmt->close();
}

// The function that is called when the bot runs
// (Profiles on other servers than bsky.social can't be batch fetched using
// $bbdq_bluesky_handle, so it was easiest to put that in its own function)
function get_profiles(): void {
	global $conn, $bbdq_bluesky_handle, $bbdq_bluesky_password;

	// Get all identifiers from bsky.social
	$query = 'SELECT did FROM bbdq WHERE provider = "https://bsky.social" OR provider = ""';
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
		$res = fetch('https://bsky.social/xrpc/app.bsky.actor.getProfiles', [
			'method' => 'GET',
			'query' => $query_string,
			'token' => $session['accessJwt'],
		]);

		foreach ($res['profiles'] as $profile) {
			saveProfile($profile, $conn);
		}
	}
}

function get_external_profiles(): void {
	global $conn, $encryption_key;

	// Get all identifiers from bsky.social
	$query = 'SELECT provider, password, iv, did FROM bbdq WHERE provider != "" AND provider != "https://bsky.social"';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	while ($row = $result->fetch_assoc()) {
		$password = openssl_decrypt($row['password'], 'aes-256-cbc', $encryption_key, 0, hex2bin($row['iv']));
		$session = atproto_create_session($row['provider'], $row['did'], $password);
		if (!$session || isset($session['error'])) {
			// Wrong bluesky username/password
			continue;
		}

		$query_string = '?actor=' . $row['did'];
		$profile = fetch($row['provider'] . '/xrpc/app.bsky.actor.getProfile', [
			'method' => 'GET',
			'query' => $query_string,
			'token' => $session['accessJwt'],
		]);

		saveProfile($profile, $conn);
	}
}

get_profiles();
get_external_profiles();