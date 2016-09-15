<?php
header('Access-Control-Allow-Origin: '.$_SERVER['SERVER_NAME'].':'.$_SERVER['SERVER_PORT']);
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header('Content-Type: application/json');

function alexa_rank($url){
	$xml = simplexml_load_file("http://data.alexa.com/data?cli=10&url=".$url);

	if (! $xml->SD)
		return false;

	$errors = array();

	$popularity = get_class($xml->SD->POPULARITY->attributes()->TEXT) !== false ? $xml->SD->POPULARITY->attributes()->TEXT->__toString() : null;
	if ($popularity === null)
		$errors[] = "No popularity rating";
	
	$reach = get_class($xml->SD->REACH->attributes()->RANK) !== false ? $xml->SD->REACH->attributes()->RANK->__toString() : null;
	if ($reach === null)
		$errors[] = "No reach data";
	
	$rankdelta = get_class($xml->SD->RANK->attributes()->DELTA) !== false ? $xml->SD->RANK->attributes()->DELTA->__toString() : null;
	if ($rankdelta === null)
		$errors[] = "No rank delta info";
	
	$country_name = get_class($xml->SD->COUNTRY->attributes()->NAME) !== false ? $xml->SD->COUNTRY->attributes()->NAME->__toString() : null;
	if ($country_name === null)
		$errors[] = "No specific country name data";
	
	$country_code = get_class($xml->SD->COUNTRY->attributes()->CODE) !== false ? $xml->SD->COUNTRY->attributes()->CODE->__toString() : null;
	if ($country_code === null)
		$errors[] = "No specific country code data";
	
	$country_rank = get_class($xml->SD->COUNTRY->attributes()->RANK) !== false ? $xml->SD->COUNTRY->attributes()->RANK->__toString() : null;
	if ($country_rank === null)
		$errors[] = "No specific country rank data";
	

	return array("popularity" => $popularity,
				 "reach" => $reach,
				 "rank_delta" => $rankdelta,
				 "country_name" => $country_name,
				 "country_code" => $country_code,
				 "country_rank" => $country_rank,
				 "errors" => $errors);
}

function linked_in_data($url){
	$data = file_get_contents("https://www.linkedin.com/countserv/count/share?url=".urlencode($url)."&format=json");
	return json_decode($data);
}

function stumble_data($url){
	$data = file_get_contents("https://www.stumbleupon.com/services/1.01/badge.getinfo?url=".urlencode($url));
	return json_decode($data);
}

$retArr = array();
$retArr["requested-from"] = $_SERVER['SERVER_NAME'].':'.$_SERVER['SERVER_PORT'];
$url = $_POST["url"];

$url = "http://www.lucep.com";

$retArr["status"] = true;
$retArr["error"] = false;
$retArr["url"] = $parsed_url["scheme"]."://".$parsed_url["host"];

$parsed_url = parse_url($url);
try{
	if ($url && $parsed_url["host"]){
		$alexa = alexa_rank($parsed_url["scheme"]."://".$parsed_url["host"]);
		if (!$alexa)
			$retArr["alexa"] = array("errors"=>"no data returned");
		else
			$retArr["alexa"] = $alexa;

		$linkedin = linked_in_data($parsed_url["scheme"]."://".$parsed_url["host"]);
		if (!$linkedin)
			$retArr["linkedin"] = array("errors"=>"no data returned");
		else
			$retArr["linkedin"] = $linkedin;

		$stumble = stumble_data($parsed_url["scheme"]."://".$parsed_url["host"]);
		if (!$stumble)
			$retArr["stumbleupon"] = array("errors"=>"no data returned");
		else
			$retArr["stumbleupon"] = $stumble;

	}else{
		throw new Exception ("No URL provided");
	}
}catch(Exception $e){
	$retArr["status"] = false;
	$retArr["error"] = true;
	$retArr["url"] = $url;
	$retArr["debug"] = $e->getMessage();
 }

echo json_encode($retArr);