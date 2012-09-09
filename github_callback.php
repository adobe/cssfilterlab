<?php
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

require("config.php");

function github_auth($code, $state) 
{
	global $config;
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, "https://github.com/login/oauth/access_token");
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));
	curl_setopt($ch, CURLOPT_POSTFIELDS, array(
		"client_id" => $config["clientId"],
		"client_secret" => $config["clientSecret"],
		"code" => $code,
		"state" => $state
	));

	$result = curl_exec($ch);

	curl_close($ch);

	return $result;
}

if (isset($_GET['code']) && isset($_GET['state'])) {
	$result = array(
		"code" => $_GET['code'],
		"state" => $_GET['state'],
		"github" => @json_decode(github_auth($_GET['code'], $_GET['state']))
	);
	?>
<script>
window.onload = function() {
	window.opener.postMessage(<?=json_encode($result)?>, location.origin);
	window.close();
}
</script>
	<?php
}
