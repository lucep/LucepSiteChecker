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
$retArr = array();
$retArr["requested-from"] = $_SERVER['SERVER_NAME'].':'.$_SERVER['SERVER_PORT'];
$url = $_POST["url"];

$parsed_url = parse_url($url);
try{
	if ($url && $parsed_url["host"]){
		$res = alexa_rank($parsed_url["scheme"]."://".$parsed_url["host"]);
		if (!$res)
			throw new Exception ("No Alexa data found for this website");

		$retArr["status"] = true;
		$retArr["error"] = false;
		$retArr["url"] = $parsed_url["scheme"]."://".$parsed_url["host"];
		$retArr["alexa"] = $res;

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