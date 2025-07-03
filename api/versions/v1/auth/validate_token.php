<?php

function validate_token($token, $secret) {
	// Split the token in three.
	$token_arr = explode('.', $token);

	// Check the signature.
	if (!isset($token_arr[2]) || $token_arr[2] != base64url_encode(hash_hmac('SHA512', $token_arr[0] . '.' . $token_arr[1], $secret, true))) {
		return [
			'valid' => false,
			'error' => 'TOKEN_INVALID'
		];
	}

	// It's valid, so decode the payload.
	$payload_json = base64url_decode($token_arr[1]);
	$payload = json_decode($payload_json);

	// Check if the token has expired.
	if (!is_object($payload) || !isset($payload->exp) || $payload->exp < time()) {
		return [
			'valid' => false,
			'payload_json' => $payload_json,
			'error' => 'TOKEN_EXPIRED'
		];
	}

	// It's not expired, let's return some values!
	return [
		'valid' => true,
		'id' => $payload->id,
		'level' => $payload->level,
	];
} // validate_token()