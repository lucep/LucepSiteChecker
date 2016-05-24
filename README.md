# LucepSiteChecker
A few quick scripts to enable site assessment using publicly available APIs

## Getting started
### Google API Key
You will need to create your own API key for use with the Google PageSpeed API.

You can do that by visiting https://console.developers.google.com/apis/credentials

### Alexa Page Rank
To retrieve the Alexa page rank details, you will need to host the PHP file that retrieves data from Alexa on your own webserver

## Implementation
To use the tool, the following snippet (available in `test.js`) provides an insight:
```
$lucepsitechecker.load_google_apikey("YOUR-API-KEY-HERE");
$lucepsitechecker.load_alexa_query_endpoint("./alexa.php");

$lucepsitechecker.set_site("https://lucep.com");

//get the alexa ranking details and print to the console
$lucepsitechecker.get_alexa_details(
	function (resp){ 
		console.log(resp); 
	});

//get the Google PageSpeed Analysis for Desktop and render the screenshot
$lucepsitechecker.get_google_analysis_desktop(
	function (resp) { 
		console.log(resp); 
		var j= document.createElement("img");
		j.id = "screenshot";
		j.src = "data:"+$lucepsitechecker.google.screenshot.mime_type+";base64,"+$lucepsitechecker.google.screenshot.data.replace(/_/g,"/").replace(/-/g,"+");
		document.body.appendChild(j);
	});

//get the Google PageSpeed Analysis for Mobile and render the screenshot
$lucepsitechecker.get_google_analysis_mobile(
	function (resp) {
		console.log(resp);
		var j= document.createElement("img");
		j.id = "mobscreenshot";
		j.src = "data:"+$lucepsitechecker.google.screenshot.mime_type+";base64,"+$lucepsitechecker.google.screenshot.data.replace(/_/g,"/").replace(/-/g,"+");
		document.body.appendChild(j);
	});

```