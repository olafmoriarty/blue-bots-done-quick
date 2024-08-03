<?php

include('tlds.php');
define( "MENTION_REGEX",  "/(^|\s|\()(@)([a-zA-Z0-9.-]+)(\b)/");
define( "URL_REGEX",  "/(^|\s|\()((https?:\/\/[\S]+)|((?<domain>[a-z][a-z0-9]*(\.[a-z0-9]+)+)[\S]*))/im");
define("TRAILING_PUNCTUATION_REGEX", "/\p{P}+$/");
define("TAG_REGEX", "/(^|\s)[#＃]((?!xfe0f)[^\s\u{00AD}\u{2060}\u{200A}\u{200B}\u{200C}\u{200D}\u{20e2}]*[^\d\s\p{P}\u{00AD}\u{2060}\u{200A}\u{200B}\u{200C}\u{200D}\u{20e2}]+[^\s\u{00AD}\u{2060}\u{200A}\u{200B}\u{200C}\u{200D}\u{20e2}]*)?/u");

function isValidDomain($str) {
	$tlds = get_valid_tlds();

	$domain_parts = explode('.', $str);
	$domain_part_count = count($domain_parts);
	if ($domain_part_count < 2) {
		return false;
	}
	if (!in_array($domain_parts[$domain_part_count - 1], $tlds)) {
		return false;
	}

	return true;
  }
  
function detectFacets($text) {

	$facets = [];

	// Mentions
	preg_match_all(MENTION_REGEX, $text, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);

	foreach ($matches as $match) {
		if (!isValidDomain($match[3][0]) && !str_ends_with($match[3][0], '.test')) {
			continue;
		}
		$start = strpos($text, $match[3][0], $match[0][1]) - 1;
		$end = $match[3][1] + strlen($match[3][0]);

		$facets[] = [
			'$type' => 'app.bsky.richtext.facet',
			'index' => [
				'byteStart' => $start,
				'byteEnd' => $end,
			],
			'features' => [
				[
					'$type' => 'app.bsky.richtext.facet#mention',
					'did' => $match[3][0], // must be resolved afterwards
				]
			]
		];
	}

	// Links
	preg_match_all(URL_REGEX, $text, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);

	foreach ($matches as $match) {
		$uri = $match[2][0];
		if (!str_starts_with($uri, 'http')) {
			$domain = $match['domain'][0];
			if (!$domain || !isValidDomain($domain)) {
				continue;
			}
			$uri = 'https://' . $uri;
		}
		$index = [
			'start' => $match[2][1],
			'end' => $match[2][1] + strlen($match[2][0]),
		];

		if (preg_match("/[.,;:!?]$/", $uri)) {
			$uri = substr($uri, 0, -1);
			$index['end']--;
		}
		if (str_ends_with($uri, ')') && !str_contains($uri, '(')) {
			$uri = substr($uri, 0, -1);
			$index['end']--;
		}

		$facets[] = [
			'$type' => 'app.bsky.richtext.facet',
			'index' => [
				'byteStart' => $index['start'],
				'byteEnd' => $index['end'],
			],
			'features' => [
				[
					'$type' => 'app.bsky.richtext.facet#link',
					'uri' => $uri,
				]
			]
		];
	
	}

	// Hashtags
	preg_match_all(TAG_REGEX, $text, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);
	foreach ($matches as $match) {
		$leading = $match[1][0];
		$tag = $match[2][0];

		if (!$tag) {
			continue;
		}

		$tag = trim($tag);
		$tag = preg_replace(TRAILING_PUNCTUATION_REGEX, '', $tag);

		if (strlen($tag) === 0 || strlen($tag) > 64) {
			continue;
		}
		$index = $match[2][1];
		$facets[] = [
			'$type' => 'app.bsky.richtext.facet',
			'index' => [
				'byteStart' => $index - 1,
				'byteEnd' => $index + strlen($tag),
			],
			'features' => [
				[
					'$type' => 'app.bsky.richtext.facet#tag',
					'tag' => $tag,
				]
			]
		];
	}

if (count($facets)) {
	return $facets;
}
return;
}
