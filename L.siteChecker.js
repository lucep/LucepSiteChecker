// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name L.sitePerformance.js
// ==/ClosureCompiler==

/***** L.sitePerformance.js *****
 * 
 * The purpose of this script is to allow site owners to review and compare the
 * performance of their site in comparison to others, leveraging publicly
 * available APIs for this purpose
 *
 * Code from multiple different sources are used, where applicable credits for
 * those code snippets/libraries are provided
 *
 * This script is designed to be closure compilable for efficiency.
 *
 * Contributors:
 *    Kaiesh Vohra - @kaiesh - https://github.com/kaiesh
 **/


(function (exports) {

//Promise AJAX
/*
 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
 *  Licensed under the New BSD License.
 *  https://github.com/stackp/promisejs
 */

/**
 * @constructor
 */
    function aPromise() {
        this._callbacks = [];
    }

    aPromise.prototype.then = function(func, context) {
        var p;
        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {
            p = new aPromise();
            this._callbacks.push(function (res) {
                var res = func.apply(context, arguments);
                if (res && typeof res.then === 'function')
                    res.then(p.done, p);
            });
        }
        return p;
    };

/**
 * @param {...} var_args
 */
    aPromise.prototype.done = function(var_args) {
        this.result = arguments;
        this._isdone = true;
        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
        }
        this._callbacks = [];
    };

    function join(promises) {
        var p = new aPromise();
        var results = [];

        if (!promises || !promises.length) {
            p.done(results);
            return p;
        }

        var numdone = 0;
        var total = promises.length;

        function notifier(i) {
            return function(res) {
                numdone += 1;
                results[i] = Array.prototype.slice.call(arguments);
                if (numdone === total) {
                    p.done(results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
        }

        return p;
    }

    function chain(funcs, args) {
        var p = new aPromise();
        if (funcs.length === 0) {
            p.done.apply(p, args);
        } else {
            funcs[0].apply(null, args).then(function() {
                funcs.splice(0, 1);
                chain(funcs, arguments).then(function() {
                    p.done.apply(p, arguments);
                });
            });
        }
        return p;
    }

    /*
     * AJAX requests
     */

    function _encode(data) {
        var payload = "";
        if (typeof data === "string") {
            payload = data;
        } else {
            var e = encodeURIComponent;
            var params = [];

            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    params.push(e(k) + '=' + e(data[k]));
                }
            }
            payload = params.join('&')
        }
        return payload;
    }

    function new_xhr() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        return xhr;
    }


    function ajax(method, url, data, headers) {
        var p = new aPromise();
        var xhr, payload;
        data = data || {};
        headers = headers || {};

        try {
            xhr = new_xhr();
        } catch (e) {
            p.done(promise.ENOXHR, "");
            return p;
        }

        payload = _encode(data);
        if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
        }

        xhr.open(method, url);

        var content_type = 'application/x-www-form-urlencoded';
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                if (h.toLowerCase() === 'content-type')
                    content_type = headers[h];
                else
                    xhr.setRequestHeader(h, headers[h]);
            }
        }
        xhr.setRequestHeader('Content-type', content_type);


        function onTimeout() {
            xhr.abort();
            p.done(promise.ETIMEOUT, "", xhr);
        }

        var timeout = promise.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var err = (!xhr.status ||
                           (xhr.status < 200 || xhr.status >= 300) &&
                           xhr.status !== 304);
                p.done(err, xhr.responseText, xhr);
            }
        };

        xhr.send(payload);
        return p;
    }

    function _ajaxer(method) {
        return function(url, data, headers) {
            return ajax(method, url, data, headers);
        };
    }

    var promise = {
        Promise: aPromise,
        join: join,
        chain: chain,
        ajax: ajax,
        get: _ajaxer('GET'),
        post: _ajaxer('POST'),
        put: _ajaxer('PUT'),
        del: _ajaxer('DELETE'),

        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,

        /**
         * Configuration parameter: time in milliseconds after which a
         * pending AJAX request is considered unresponsive and is
         * aborted. Useful to deal with bad connectivity (e.g. on a
         * mobile network). A 0 value disables AJAX timeouts.
         *
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 0
    };

    if (typeof define === 'function' && define["amd"]) {
        /* AMD support */
        define(function() {
            return promise;
        });
    } else {
        window.promise = promise;
    }

	var sitePerformanceChecker = {};

	sitePerformanceChecker["load_google_apikey"] = function(apikey){
		sitePerformanceChecker.google_apikey = apikey;
	};
	sitePerformanceChecker["load_reach_and_social_endpoint"] = function (endpoint_addr){
		sitePerformanceChecker.rns_endpoint = endpoint_addr;
	};

	sitePerformanceChecker["set_site"] = function(site_address){
		sitePerformanceChecker.site = site_address;
	};
	sitePerformanceChecker["get_reach_and_social_data"] = function(callback){
		promise.post(sitePerformanceChecker.rns_endpoint, {"url": sitePerformanceChecker.site})
			.then(function (err, response, xhr){
				if (err){
					console.log("Error: "+xhr.status);
					console.log("Unable to retrieve reach and social details");
					if (typeof callback=="function")
						callback({"status": false, "error": true});
				}else{
					var rns = JSON.parse(response);
					sitePerformanceChecker["alexa"] = rns["alexa"];
					sitePerformanceChecker["linkedin"] = rns["linkedin"];
					sitePerformanceChecker["stumbleupon"] = rns["stumbleupon"]
					if (typeof callback=="function")
						callback({"status": rns["status"], 
								  "alexa": rns["alexa"],
								  "linkedin": rns["linkedin"],
								  "stumbleupon":rns["stumbleupon"]});
				}
			});
		return true;
	}

	sitePerformanceChecker["get_google_analysis_desktop"] = function(callback){
		promise.get("https://www.googleapis.com/pagespeedonline/v2/runPagespeed", 
					{"url": sitePerformanceChecker.site,
					 "screenshot": "true",
					 "strategy": "desktop",
					 "key": sitePerformanceChecker.google_apikey})
			.then(function (err, response, xhr){
				if (err){
					console.log("Error:"+xhr.status);
					console.log("Unable to retrieve Google Insights");
					if (typeof callback=="function")
						callback({"status":false, "error": true});
				}else{
					var goog = JSON.parse(response);
					sitePerformanceChecker["google"] = goog;
					if (typeof callback=="function")
						callback({"status": true, "google": goog});
				}
			});
					 
	};

	sitePerformanceChecker["get_google_analysis_mobile"] = function(callback){
		promise.get("https://www.googleapis.com/pagespeedonline/v2/runPagespeed", 
					{"url": sitePerformanceChecker.site,
					 "screenshot": "true",
					 "strategy": "mobile",
					 "key": sitePerformanceChecker.google_apikey})
			.then(function (err, response, xhr){
				if (err){
					console.log("Error:"+xhr.status);
					console.log("Unable to retrieve Google Insights");
					if (typeof callback=="function")
						callback({"status":false, "error": true});
				}else{
					var goog = JSON.parse(response);
					sitePerformanceChecker["google"] = goog;
					if (typeof callback=="function")
						callback({"status": true, "google": goog});
				}
			});
					 
	};

	sitePerformanceChecker["get_facebook_info"] = function(callback){
		promise.get("https://graph.facebook.com/"+sitePerformanceChecker.site,
					{})
		.then(function (err, response, xhr){
			if (err){
				console.log("Error: ".xhr.status);
				console.log("Unable to retrieve Facebook data");
				if (typeof callback=="function")
					callback({"status": false, "error": true});
			}else{
				var fb = JSON.parse(response);
				sitePerformanceChecker["facebook"] = fb;
				if (typeof callback=="function")
					callback({"status":true, "facebook":fb});
			}
		});
					
	}

	sitePerformanceChecker["get_pinterest_info"] = function(callback){
		promise.get("https://widgets.pinterest.com/v1/urls/count.json",
					{"url": sitePerformanceChecker.site,
					"source": 6})
		.then(function (err, response, xhr){
			if (err){
				console.log("Error: ".xhr.status);
				console.log("Unable to retrieve Pinterest data");
				if (typeof callback=="function")
					callback({"status": false, "error": true});
			}else{
				//strip the "receiveCount" wrapper from around the JSON
				var pin = JSON.parse(response.substr(13, response.indexOf("})", 13)-12));
				sitePerformanceChecker["pinterest"] = pin;
				if (typeof callback=="function")
					callback({"status":true, "pinterest":pin});
			}
		});
	}


	exports["$lucepsitechecker"] = sitePerformanceChecker;

})(window);

