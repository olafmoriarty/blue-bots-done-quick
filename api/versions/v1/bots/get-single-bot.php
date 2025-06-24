<?php

load_function('get_bot_details');
$details = get_bot_details($conn, $id);

return_json([
	'data' => $details,
]);