<?php

// Get Tracery parser
include('tracery-parser.php');

function generate_post($script, $origin, $max_length = 0, $n_input = 0, $full_input = '') {
	$tracery = new Tracery;
	$tracery_code = json_decode($script, true);
	
	if (!$tracery_code || !is_array($tracery_code) || ((!$origin || !isset($tracery_code[$origin])) && !$full_input)) {
		// Invalid tracery code
		return;
	}

	date_default_timezone_set('UTC');
	$increase_n = false;


	// Replace dates and n values
	foreach ($tracery_code as $key => $value) {
		$value = str_replace('{hour}', date('H'), $value);
		$value = str_replace('{month}', date('m'), $value);
		$value = str_replace('{monthName}', date('F'), $value);
		$value = str_replace('{weekday}', date('w'), $value);
		$value = str_replace('{weekdayName}', date('l'), $value);
		$value = preg_replace_callback("/\{date ([^}]+)\}/", function($matches) { return date($matches[1]); }, $value);

		$check_for_n = $value;
		if (is_array($value)) {
			$check_for_n = implode(' ', $value);
		}

		if (preg_match('/\{n(?: (?:mod|\%) (\d+))?\}/', $check_for_n)) {
			$increase_n = true;
			$value = preg_replace_callback('/\{n(?: (?:mod|\%) (\d+))?\}/', fn($matches) => isset($matches[1]) ? $n_input % $matches[1] : $n_input, $value);
		}

		$tracery_code[$key] = $value;
	}

	// Replace {item} tags
	foreach ($tracery_code as $key => $value) {
		$value = preg_replace_callback("/\{item #([^ \}]+)# (\d+)\}/", fn($matches) => isset($tracery_code[$matches[1]]) && is_array($tracery_code[$matches[1]]) ? $tracery_code[$matches[1]][$matches[2] % count($tracery_code[$matches[1]])] : '', $value);
		$tracery_code[$key] = $value;
	}

	$grammar = $tracery->createGrammar($tracery_code);
	$grammar->addModifiers($tracery->baseEngModifiers());

	$text = '';
	$possible_tags = ['img', 'svg', 'alt', 'label', 'lang'];
	$regex = '/\{(' . implode('|', $possible_tags) . ')(?:[  ]([^}]*))?}/';
	
	for ($i = 0; $i < 10; $i++) {
		$generated_text = '';
		if ($full_input) {
			$generated_text = $grammar->flatten($full_input);
		}
		else {
			$generated_text = $grammar->flatten('#' . $origin . '#');
		}
		if (!$max_length || strlen(preg_replace( $regex, '', $generated_text )) <= $max_length) {
			$text = $generated_text;
			break;
		}
	}
	return [
		'text' => $text,
		'increase_n' => $increase_n,
	];
}