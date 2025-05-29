<?php
include('atproto-functions.php');

// Simplified function to send a CURL post request
function fetch($url, $options = []) {
	if (!$url) {
		return;
	}
	$curl = curl_init();

	$headers = [
		'Content-Type: application/json',
		'Accept: application/json'
	];

	if (isset($options['token'])) {
		$headers[] = 'Authorization: Bearer ' . $options['token'];
	}

	$querystring = '';
	$method = 'POST';
	if (isset($options['method']) && $options['method'] == 'GET') {
		$method = 'GET';
		if (isset($options['query'])) {
			$querystring = $options['query'];
		}
	}

	if (isset($options['body'])) {
		$data = $options['body'];
	}

	curl_setopt_array($curl, array(
		CURLOPT_URL => $url . $querystring,
		CURLOPT_RETURNTRANSFER => true,
	  	CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,

		CURLOPT_HTTPHEADER => $headers,
	));

	if ($method === 'GET') {
		curl_setopt($curl, CURLOPT_HTTPGET, true);
	}

	if ($method === 'POST') {
		// If POST (for now, let's assume it's always POST)
		curl_setopt($curl, CURLOPT_POST, true);
		if (isset($data)) {
			curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
		}
	}

	$response = curl_exec($curl);
	
	curl_close($curl);
	return json_decode( $response, true );
}

function return_json($c, $options = []) {
	$okOrigins = [
		'bluebotsdonequick.com',
		'www.bluebotsdonequick.com',
		'localhost',
	];
	if (isset($_SERVER['HTTP_REFERER'])) {
		$url_host = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST);
	}
	if (isset($url_host) && in_array($url_host, $okOrigins)) {
		$origin = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_SCHEME) . '://' . $url_host;
		if ($url_host == 'localhost') {
			$origin .= ':' . parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PORT);
		}
	}
	else {
		$origin = 'https://bluebotsdonequick.com';
	}
	
	// Set HTTP headers
	header('Content-Type: application/json');
	header('Access-Control-Allow-Origin: ' . $origin);
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Allow-Headers: Accept, Content-Type, Authorization');
	header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
	
	// Set HTTP status (adapt to actual content)
	$status = '200';
	if (isset($options['status'])) {
		$status = $options['status'];
	}
	set_http_status_header($status);

	if (!isset($c['status']) && str_starts_with($status, '2')) {
		$c['status'] = 1;
	}
	
	// Output content as JSON
	echo json_encode($c);
	exit;
}

function return_error($error_msg, $status = '400') {
	return_json(
		[
			'status' => 0,
			'error' => $error_msg,
		],
		[
			'status' => $status,
		]
	);

}

function set_http_status_header($status) {
	$statuses = [
		'200' => 'OK',
		'400' => 'Bad Request',
		'401' => 'Unauthorized',
		'403' => 'Forbidden',
		'404' => 'Not Found',
		'405' => 'Method Not Allowed',
	];

	if (isset($statuses[$status])) {
		header("HTTP/1.1 " . $status . " " . $statuses[$status]);
	}
}

function method_check($allowed_methods) {
	if (!in_array($_SERVER['REQUEST_METHOD'], $allowed_methods)) {
		return_error('METHOD_NOT_ALLOWED', '405');
	}
}

function parameter_check($body, $mandatory) {
	$missing = [];
	foreach ( $mandatory as $parameter ) {
		if (!isset($body[$parameter])) {
			$missing[] = $parameter;
		}
	}
	if (count($missing)) {
		return_json(
			[
				'status' => 0,
				'error' => 'PARAMETERS_MISSING',
				'missing' => $missing,
			],
			[
				'status' => '400',
			]
		);
	
	}
}

function values_to_boolean($arr, $values) {
	if (!is_array($values)) {
		$values = [$values];
	}
	foreach ($values as $parameter) {
		$arr[$parameter] = (bool) $arr[$parameter];
	}
	return $arr;
}

function get_next_datetime( $json ) {
	$next_time = 0;
	$rule = '';
	$frequency = 0;

	$current_day = gmdate('j');
	$current_weekday = gmdate('w');
	$current_month = gmdate('n');
	$current_year = gmdate('Y');

	$arr = json_decode( $json, true );

	if (!is_array($arr)) {
		// JSON error or invalid JSON, give up
		return;
	}

	foreach ($arr as $row) {
		if (!is_array($row) || !isset($row['type']) || !isset($row['time'])) {
			// Not a valid row, don't bother trying to make sense out of it
			continue;
		}
		$time_parts = explode(':', $row['time']);
		if (!isset($time_parts[1]) || !is_numeric($time_parts[0]) || !is_numeric($time_parts[1])) {
			// No minutes, so the time must be invalid
			continue;
		}

		if ($row['type'] === 'd') {
			$frequency += 1 / (24 * 60);
			for ($day = -1; ; $day++) {
				$row_time = gmmktime($time_parts[0], $time_parts[1], 0, $current_month, $current_day + $day, $current_year);
				if ($row_time > time()) {
					break;
				}
			}
			if ($next_time === 0 || $row_time < $next_time) {
				$next_time = $row_time;
				$rule = '';
				if (isset($row['rule'])) {
					$rule = $row['rule'];
				}
			}
		}
		elseif ($row['type'] === 'w' && isset($row['weekdays']) && is_array($row['weekdays'])) {
			$arr_length = count($row['weekdays']);
			for ($i = 0; $i < $arr_length; $i++) {
				if (!is_numeric($row['weekdays'][$i]) ) {
					continue;
				}
				$frequency += 1 / (24 * 60 * 7);
				for ($week = -1; ; $week++) {
					$row_time = gmmktime($time_parts[0], $time_parts[1], 0, $current_month, $current_day - $current_weekday + $row['weekdays'][$i] + ($week * 7), $current_year);
					if ($row_time > time()) {
						break;
					}
				}
				if ($next_time === 0 || $row_time < $next_time) {
					$next_time = $row_time;
					$rule = '';
					if (isset($row['rule'])) {
						$rule = $row['rule'];
					}
				}
			}
		}
		elseif ($row['type'] === 'm' && isset($row['monthdays'])) {
			$arr = explode(',', $row['monthdays']);
			$arr_length = count($arr);
			for ($i = 0; $i < $arr_length; $i++) {
				$num = trim($arr[$i]);
				if (!is_numeric($num) ) {
					continue;
				}
				$frequency += 1 / (24 * 60 * 30);
				for ($month = -1; ; $month++) {
					$row_time = gmmktime($time_parts[0], $time_parts[1], 0, $current_month + $month, $num, $current_year);
					if ($row_time > time()) {
						break;
					}
				}
				if ($next_time === 0 || $row_time < $next_time) {
					$next_time = $row_time;
					$rule = '';
					if (isset($row['rule'])) {
						$rule = $row['rule'];
					}
				}
			}
		}
	}

	if (!$next_time) {
		return;
	}

	return [
		'timestamp' => $next_time,
		'rule' => $rule,
		'minutesBetweenPosts' => 1 / $frequency,
	];
}
