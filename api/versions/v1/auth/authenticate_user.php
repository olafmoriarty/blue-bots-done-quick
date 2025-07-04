<?php

// This array holds all IDs the user is currently logged in as
$ids = [];

$auth_result = get_auth_token();
if (isset($auth_result['ids']) && is_array($auth_result['ids']) && count($auth_result['ids']) > 0) {
	$ids = [ ...$auth_result['ids'] ];
}

function get_auth_token() {
	global $jwt_access_secret;

	// Is there an auth token?
	$auth = get_authorization_header();
	if (!$auth) {
		return [
			'success' => false,
			'error' => 'AUTHORIZATION_HEADER_MISSING',
		];
	}
	// Is it a bearer token?
	$auth_parts = explode(' ', $auth);
	if ($auth_parts[0] !== 'Bearer' || !isset($auth_parts[1])) {
		return [
			'success' => false,
			'error' => 'AUTHORIZATION_HEADER_INVALID',
		];
	}

	// VALIDATE TOKEN AND RETURN IDS
	include_once('validate_token.php');
	$token_result = validate_token($auth_parts[1], $jwt_access_secret);
	if ($token_result['valid'] === false) {
		return [
			'success' => false,
			'error' => $token_result['error'],
		];
	}

	return [
		'success' => true,
		'ids' => $token_result['payload']['bots'],
	];
}
