(function() {
	
	function GitHub() {

	}

	GitHub.prototype = {
		url: "https://api.github.com",

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
		}
	}

	Global.GitHub = GitHub;


})();