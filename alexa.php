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

	return array("popularity" => $xml->SD->POPULARITY->attributes()->TEXT->__toString(),
				 "reach" => $xml->SD->REACH->attributes()->RANK->__toString(),
				 "rank_delta" => $xml->SD->RANK->attributes()->DELTA->__toString(),
				 "country_name" => $xml->SD->COUNTRY->attributes()->NAME->__toString(),
				 "country_code" => $xml->SD->COUNTRY->attributes()->CODE->__toString(),
				 "country_rank" => $xml->SD->COUNTRY->attributes()->RANK->__toString());
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