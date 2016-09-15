# LucepSiteChecker
A few quick scripts to enable site assessment using publicly available APIs

### Currently supported _(working as of 15 Sep 2016)_
- Google PageSpeed
- Alexa Page Rank
- Facebook Posts (counts the number of distinct posts to your URL on Facebook)
- Pinterest count
- Linked In posts
- Stumble Upon

## Getting started
### Google API Key
You will need to create your own API key for use with the Google PageSpeed API.

You can do that by visiting https://console.developers.google.com/apis/credentials

### Alexa Page Rank, Linked In count, and StumbleUpon
To retrieve the Alexa page rank, Linked In, and StumbleUpon details, you will need to host the PHP file that retrieves data from those services on your own webserver

## Implementation
To use the tool, the following snippet (available in `test.js`) provides an insight:
```
$lucepsitechecker.load_google_apikey("YOUR-API-KEY-HERE");
$lucepsitechecker.load_reach_and_social_endpoint("./reach_and_social.php");

$lucepsitechecker.set_site("https://lucep.com");

//get the alexa ranking, linked in, and stumbleupon details and print to the console
$lucepsitechecker.get_reach_and_social_details(
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

//get facebook data and print to the console
$lucepsitechecker.get_facebook_info(
	function(e){
		console.log(e);
	}
);

//get pinterest data and print to the console
$lucepsitechecker.get_pinterest_info(
    function(e){
        console.log(e);
	}
);

```