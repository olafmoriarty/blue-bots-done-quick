<?php

// Script directory
define('API_FOLDER', dirname(__FILE__));

// Get passwords
include API_FOLDER . '/secrets.php';

// Get important functions
include API_FOLDER . '/utils/functions.php';

// Connect to MySQL
$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

