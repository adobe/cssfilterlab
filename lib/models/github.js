/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

(function() {
	
	function GitHub() {

	}

	GitHub.prototype = {
		url: "https://api.github.com",
		gistUrl: "https://gist.github.com/",

		postGist: function(id, name, files, callback) {
			var xhr = new XMLHttpRequest(),
				data = {
					"description": name,
					"files": files
				},
				url = this.url + "/gists",
				method = "POST";
			if (id) {
				url += "/" + encodeURIComponent(id);
				method = "PATCH";
			} else {
				data["public"] = false;
			}
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4)
					return;
				var response = JSON.parse(xhr.responseText);
				//console.log(response);
				callback(response);
			};

			xhr.open(method, url);
			xhr.send(JSON.stringify(data));
		},

		readGist: function(url, callback) {
			var id = url;
			if (url.indexOf(this.gistUrl) == 0)
				id = url.substr(this.gistUrl.length);
			var xhr = new XMLHttpRequest(),
				url = this.url + "/gists/" + encodeURIComponent(id);
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4 || xhr.status != 200)
					return;
				var response = JSON.parse(xhr.responseText);
				callback(null, response);
			};
			xhr.open("GET", url);
			xhr.send(null);
		}
	}

	Global.GitHub = GitHub;


})();