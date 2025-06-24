<?php

// Get URL
$url = substr($_SERVER['REQUEST_URI'], strlen( dirname($_SERVER['PHP_SELF'])));
if ($question_mark_position = strpos( $url , '?')) {
	$url = substr($url, 0, $question_mark_position);
}

// Get API version number
$version = strtok($url, '/');

// Hard-coded list of API versions
$valid_versions = [ 'v1' ];

// If version exists, include it
if ( in_array($version, $valid_versions) ) {
	include( 'versions/' . $version . '/index.php' );
	exit;
}

// If not, return an error

// Set HTTP headers
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Accept, Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

$okOrigins = [
	'bluebotsdonequick.com',
	'www.bluebotsdonequick.com',
	'localhost',
];
if (isset($_SERVER['HTTP_REFERER'])) {
	$url_host = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST);
}
if (isset($url_host) && in_array($url_host, $okOrigins)) {
	$origin = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_SCHEME) . '://' . $url_host;
	if ($url_host == 'localhost') {
		$origin .= ':' . parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PORT);
	}
}
else {
	$origin = 'https://bluebotsdonequick.com';
}
header('Access-Control-Allow-Origin: ' . $origin);

// Set HTTP status
header("HTTP/1.1 404 Not Found");

// Output content as JSON
echo json_encode([
	'status' => 0,
	'error' => 'INVALID_VERSION',
]);
exit;
