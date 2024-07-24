<?php

// Get MySQL and Bluesky login details
global $mysql_host, $mysql_user, $mysql_pass, $mysql_db;
include 'secrets.php';
include 'functions.php';

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

// Since this is such a simple script, I'm using the 'mode' parameter of the 
// body instead of URL-based endpoints. If the API grows, I may reconsider this.
if (!isset($body['mode']) || !$body['mode']) {
	return_error('NO_ENDPOINT_SELECTED');
}

$endpoint = $body['mode'];

// List of valid endpoints
$valid_endpoints = ['login', 'edit', 'delete', 'list'];

if (!in_array($endpoint, $valid_endpoints)) {
	return_error('INVALID_ENDPOINT', '404');
}

include $endpoint . '.php';
	// Check username and password against bsky
	// Return error if auth failed

	// If success:
	// Check that all required fields are present
	// Return error if required fields are missing
	// Return error if not valid JSON
	// Encrypt password
	// Save row to database

