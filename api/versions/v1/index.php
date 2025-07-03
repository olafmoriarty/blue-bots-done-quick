<?php

// Script directory
define('API_FOLDER', dirname(__FILE__));

// Get MySQL and Bluesky login details
global $mysql_host, $mysql_user, $mysql_pass, $mysql_db;
include API_FOLDER . '/secrets.php';
include API_FOLDER . '/utils/functions.php';

// Connect to MySQL
$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

// Return empty response on preflight check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	return_json([]);
}

// Get body content - either from $_GET or from php://input
$body = [];
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$body = $_GET;
}
else {
	$body = json_decode(file_get_contents("php://input"), true);
}

$endpoint = strtok('/');
if (!$endpoint) {
	return_error('NO_ENDPOINT_SELECTED');
}

// List of valid endpoints
$valid_endpoints = ['bots', 'auth'];

if (!in_array($endpoint, $valid_endpoints)) {
	return_error('INVALID_ENDPOINT', '404');
}

// Authenticate user
include 'auth/authenticate_user.php';

include API_FOLDER . '/' . $endpoint . '/' . $endpoint . '.php';

// If nothing has been returned by any endpoint, return an empty object.
return_json([]);