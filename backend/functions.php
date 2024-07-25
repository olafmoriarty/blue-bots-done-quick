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