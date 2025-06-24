<?php

// Is there an ID given after /bots/?
$id = strtok('/');

if ($id) {
	switch ($_SERVER['REQUEST_METHOD']) {
		case 'GET':
			include 'get-single-bot.php';
			break;
		case 'PATCH':
			include 'edit-bot.php';
			break;
		case 'DELETE':
			include 'delete-bot.php';
			break;
		default:
			return_error('METHOD_NOT_ALLOWED', '405');
	}
}
else {
	switch ($_SERVER['REQUEST_METHOD']) {
		case 'GET':
			include 'bot-list.php';
			break;
		default:
			return_error('METHOD_NOT_ALLOWED', '405');
	}
}