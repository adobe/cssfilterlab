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