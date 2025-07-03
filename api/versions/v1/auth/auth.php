<?php

if (isset($body['action']) && $body['action'] === 'logOut') {
	// Write/include log out function here
}
else {
	include 'login.php';
}
