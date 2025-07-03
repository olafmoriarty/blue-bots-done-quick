<?php

// This array holds all IDs the user is currently logged in as
$ids = [];

/*
$auth_ids = get_auth_token();
if ($auth_ids && is_array($auth_ids) && count($auth_ids) > 0) {
	$ids = [ ...$auth_ids ];
}

function get_auth_token() {

	// Is there an auth token?
	$auth = get_authorization_header();
	if (!$auth) {
		return;
	}
	// Is it a bearer token?
	$auth_parts = explode(' ', $auth);
	if ($auth_parts[0] !== 'Bearer') {
		return;
	}

	// VALIDATE TOKEN AND RETURN IDS
	return [];
}

*/