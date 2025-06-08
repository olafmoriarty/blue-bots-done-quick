<?php
include('secrets.php');

$conn = mysqli_connect(
	$mysql_host, 
	$mysql_user,
	$mysql_pass,
	$mysql_db
);

$table_name = 'bbdq';

try {

$rows = [
	"`id` int(10) NOT NULL AUTO_INCREMENT",
	"`active` smallint(1) NOT NULL DEFAULT 0",
	"`provider` varchar(255) NOT NULL",
	"`did` varchar(255) NOT NULL",
	"`identifier` varchar(255) NOT NULL",
	"`password` varchar(255) NOT NULL",
	"`accessJwt` TEXT NULL",
	"`accessJwt_time` DATETIME NULL",
	"`refreshJwt` TEXT NULL",
	"`refreshJwt_time` DATETIME NULL",
	"`iv` varchar(32) NOT NULL",
	"`script` mediumtext DEFAULT NULL",
	"`language` varchar(2) NOT NULL DEFAULT 'en'",
	"`lastPost` datetime NOT NULL DEFAULT '2000-01-01 00:00:00'",
	"`lastPostText` text DEFAULT NULL",
	"`n_value` int(10) NOT NULL DEFAULT 0",
	"`lastNotification` varchar(32) NOT NULL DEFAULT ''",
	"`minutesBetweenPosts` int(10) DEFAULT NULL",
	"`msg` varchar(255) DEFAULT NULL",
	"`reply` varchar(255) DEFAULT NULL",
	"`replyMode` tinyint(1) NOT NULL DEFAULT 0",
	"`replyScript` mediumtext DEFAULT NULL",
	"`autopostMode` tinyint(1) DEFAULT 0",
	"`autopostTimes` text NULL",
	"`nextPost` datetime NULL",
	"`nextPostContents` text NULL",
	"`name` varchar(255) DEFAULT NULL",
	"`thumb` varchar(255) DEFAULT NULL",
	"`followers` int(10) DEFAULT NULL",
	"`activeSince` datetime DEFAULT NULL",
	"`actionIfLong` smallint(1) NOT NULL DEFAULT 0",
	"`showSource` smallint(1) NOT NULL DEFAULT 0",
	"`hideOnBotList` smallint(1) NOT NULL DEFAULT 0",
];

// Check if bbdq table exists
$query = 'SHOW TABLES LIKE "' . $table_name . '"';
$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

if ($result->num_rows) {
	foreach ($rows as $row) {
		$words = explode(' ', $row);
		$column = str_replace('`', '', $words[0]);
		$query = 'SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`="' . $mysql_db . '" AND `TABLE_NAME`="' . $table_name . '" AND `COLUMN_NAME`="' . $column . '"';
		$stmt = $conn->prepare($query);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();

		if (!$result->num_rows) {
			$query = 'ALTER TABLE ' . $table_name . ' ADD COLUMN ' . $row;
			$stmt = $conn->prepare($query);
			$stmt->execute();
			$result = $stmt->get_result();
			$stmt->close();
			echo "Added column " . $column . '<br>';
		}
	}
	echo "MySQL table updated";
}
else {
	$query = 'CREATE TABLE `' . $table_name . '` (' . implode(', ', $rows) . ',   PRIMARY KEY (`id`), UNIQUE KEY `did` (`did`), KEY `identifier` (`identifier`,`provider`) USING BTREE ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci';
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
	echo "MySQL table created";
}
} catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
}