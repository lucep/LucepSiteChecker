//You need to generate your own API key up at https://console.developers.google.com/apis/credentials
$lucepsitechecker.load_google_apikey("YOUR-API-KEY-HERE");
//You will need to host your own, or use a public endpoint to provide Alexa data
$lucepsitechecker.load_alexa_query_endpoint("./alexa.php");

$lucepsitechecker.set_site("https://lucep.com");

$lucepsitechecker.get_alexa_details(
	function (resp){ 
		console.log(resp); 
	});
$lucepsitechecker.get_google_analysis_desktop(
	function (resp) { 
		console.log(resp); 
		var j= document.createElement("img");
		j.id = "screenshot";
		j.src = "data:"+$lucepsitechecker.google.screenshot.mime_type+";base64,"+$lucepsitechecker.google.screenshot.data.replace(/_/g,"/").replace(/-/g,"+");
		document.body.appendChild(j);
	});

$lucepsitechecker.get_google_analysis_mobile(
	function (resp) {
		console.log(resp);
		var j= document.createElement("img");
		j.id = "mobscreenshot";
		j.src = "data:"+$lucepsitechecker.google.screenshot.mime_type+";base64,"+$lucepsitechecker.google.screenshot.data.replace(/_/g,"/").replace(/-/g,"+");
		document.body.appendChild(j);
	});
