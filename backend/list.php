<?php
method_check(['GET']);

$sorting_criteria = 'followers DESC';
if (isset($mode['sort']) && $mode['sort'] == 'activeSince') {
	$sorting_criteria = 'activeSince DESC';
}
$count = 10;
if (isset($mode['count']) && is_numeric($mode['count'])) {
	$count = $mode['count'];
}
$count = floor($count);
if ($count < 1) {
	$count = 1;
}
if ($count > 100) {
	$count = 100;
}


$query = 'SELECT name, identifier, lastPostText, thumb, script, showSource FROM bbdq WHERE active = 1 AND provider = "https://bsky.social" ORDER BY ' . $sorting_criteria . ' LIMIT ' . $count;
$stmt = $conn->prepare($query);
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

return_json(['data' => $data]);