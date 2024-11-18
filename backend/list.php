<?php
global $conn;
method_check(['GET']);

$sorting_criteria = 'followers DESC';
if (isset($body['sort']) && $body['sort'] == 'activeSince') {
	$sorting_criteria = 'activeSince DESC';
}
$count = 10;
if (isset($body['count']) && is_numeric($body['count'])) {
	$count = $body['count'];
}
$count = floor($count);
if ($count < 1) {
	$count = 1;
}
if ($count > 100) {
	$count = 100;
}

$page = 1;
if (isset($body['page']) && is_numeric($body['page'])) {
	$page = $body['page'];
}
$page = floor($page);
if ($page < 1) {
	$page = 1;
}
$handle = '';
if (isset($body['handle'])) {
	$handle = $body['handle'];
}



$query = 'SELECT name, did, identifier, lastPostText, thumb, script, showSource, followers, activeSince FROM bbdq WHERE active = 1';
if ($handle) {
	$query .= ' AND identifier = ?';
}
else {
	$query .= ' ORDER BY ' . $sorting_criteria . ' LIMIT ' . (($page - 1) * $count ) . ', ' . $count;
}
$stmt = $conn->prepare($query);
if ($handle) {
	$stmt->bind_param('s', $handle);
}
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

$data = [];
while ($row = $result->fetch_assoc()) {
	if (!$row['showSource']) {
		unset($row['script']);
	}
	unset($row['showSource']);
	$data[] = $row;
}

$query = 'SELECT COUNT(id) AS total FROM bbdq WHERE active = 1';
$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();
$total_row = $result->fetch_assoc();
$total = $total_row['total'];

return_json(['data' => $data, 'total' => $total]);