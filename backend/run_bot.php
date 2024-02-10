<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include('atproto.php');
include('secrets.php');

$bs = new ATProto();

$user_exists = $bs->create_session($bluesky_handle, $bluesky_password);
if ($user_exists) {
	$bs->create_post('Lorem ipsum');
}
else {
	echo 'Error, invalid login';
}