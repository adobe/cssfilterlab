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
	function LoadingProgressView(el) {
		this.el = el;
		this.labelEl = el.find(".label");
		this.progressBarEl = el.find(".progress-bar");
		this.progressBarInteriorEl = $("<div />").addClass("progress-bar-interior").appendTo(this.progressBarEl);
	}

	LoadingProgressView.prototype = {
		setValue: function(value) {
			var progress = Math.round(Math.max(0, Math.min(1, value)) * 100) + "%";
			this.progressBarInteriorEl.css("width", progress);
			this.labelEl.text("Loading " + progress);
		},
		hide: function() {
			$(this.el).hide();
		}
	};

	Global.LoadingProgressView = LoadingProgressView;

})();
