<?php

class ATProto {
	private $username;
	private $token;
	
	private $xrpc = 'https://bsky.social/xrpc/';

	public function create_session( $username, $password ) {

		if (!$username || !$password) {
			echo 'No auth';
			return;
		}

		$response = $this->curl(
			'com.atproto.server.createSession',
			[
				'identifier' => $username,
				'password' => $password
			]
		);

		if (isset($response) && isset($response['accessJwt'])) {
			$this->username = $username;
			$this->token = $response['accessJwt'];
			return true;
		}
		return false;
	}

	function create_post( $text ) {
		if (!$this->token) {
			echo 'No token';
			return;
		}

		$response = $this->curl(
			'com.atproto.repo.createRecord',
			[
				'repo' => $this->username,
				'collection' => 'app.bsky.feed.post',
				'record' => [
					'text' => $text,
					'createdAt' => date('c')
				]
			]
		);
	}

	private function curl( $endpoint, $data ) {
		$curl = curl_init();

		$headers = [
			'Content-Type: application/json',
			'Accept: application/json'
		];
		if ($this->token && $endpoint !== 'com.atproto.server.createSession') {
			$headers[] = 'Authorization: Bearer ' . ($this->token);
		}

		curl_setopt_array($curl, array(
		  CURLOPT_URL => ($this->xrpc) . $endpoint,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'POST',
		  CURLOPT_POSTFIELDS => json_encode( $data ),
		  CURLOPT_HTTPHEADER => $headers,
		));
		
		$response = curl_exec($curl);
		
		curl_close($curl);
		return json_decode($response, true);
	} 
}
