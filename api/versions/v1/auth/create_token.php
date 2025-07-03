<?php

function create_token( $payload, $secret, $lifespan_in_minutes = 120 ) {
	$jwt_header = [
		'alg' => 'HS512', 
		'typ' => 'JWT'
	];
	$jwt_payload = [
		...$payload,
		"iat" => time(),
		"exp" => time() + ($lifespan_in_minutes * 60),
	];
	$jwt1 = base64url_encode( json_encode( $jwt_header ) );
	$jwt2 = base64url_encode( json_encode( $jwt_payload ) );

	$jwt3 = base64url_encode(hash_hmac('SHA512', $jwt1 . '.' . $jwt2, $secret, true));

	// Generate complete token
	$token = $jwt1 . '.' . $jwt2 . '.' . $jwt3;

	return $token;
}

