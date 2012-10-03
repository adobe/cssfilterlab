/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    
    function GitHub() {
        GitHub.$super.call(this);
        window.addEventListener("message", this.onReceivedMesssage.bind(this), false);
    }
    
    Global.Utils.extend(GitHub).from(Global.EventDispatcher);

    $.extend(GitHub.prototype, {
        clientId: "9d5764d5b3fb3dbea0d6",

        url: "https://api.github.com",
        gistUrl: "https://gist.github.com/",
        loginUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",

        postGist: function(access_token, id, publicGist, name, files, callback) {
            var xhr = new XMLHttpRequest(),
                data = {
                    "description": name,
                    "files": files
                },
                url = this.url + "/gists?client_id=" + encodeURIComponent(this.clientId),
                method = "POST";
            if (id) {
                url += "/" + encodeURIComponent(id);
                method = "PATCH";
            } else {
                data["public"] = publicGist;
            }
            if (access_token)
                url += "?access_token=" + encodeURIComponent(access_token);
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4)
                    return;
                var response = JSON.parse(xhr.responseText);
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
                url = this.url + "/gists/" + encodeURIComponent(id) + "?client_id=" + encodeURIComponent(this.clientId);
            xhr.onreadystatechange = function() {
                if (xhr.status == 400 || xhr.status == 404){
                    callback(xhr.status, null)
                    return
                }
                if (xhr.readyState != 4 || xhr.status != 200){
                    return
                }
                var response = JSON.parse(xhr.responseText);
                callback(null, response);
            };
            xhr.open("GET", url);
            xhr.send(null);
        },

        _lastState: null,
        getLoginUrl: function() {
            this._lastState = Math.random();
            return this.loginUrl + "?client_id=" + encodeURIComponent(this.clientId) + "&scope=gist&state=" + encodeURIComponent(this._lastState);
        },

        onReceivedMesssage: function(event) {
            if (event.origin != location.origin)
                return;
            var data = event.data;
            if (data.state != this._lastState) {
                console.error("Invalid state read from github.")
                return;
            }
            if (!data.github.access_token) {
                this.fire("login", ["Invalid token"]);
                return;
            }
            this.fire("login", [null, data.github.access_token]);
        }
    });

    Global.GitHub = GitHub;


})();