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
	
	function DockPanel(name) {
		DockPanel.super.call(this);
		this.name = name;
		this.initPanel();
		this.active = false;
	}

	Global.Utils.extend(DockPanel).from(Global.EventDispatcher);
	
	$.extend(DockPanel.prototype, {
		initPanel: function() {
			var self = this;
			this.el = $("<div />")
				.addClass("panel-view");
			this.tabEl = $("<div />")
				.addClass("panel-tab")
				.text(this.name)
				.click(function() {
					self.setActive(true);
					return false;
				});
		},

		setActive: function(active) {
			this.active = active;
			this.el.toggleClass("active", active);
			this.tabEl.toggleClass("active", active);
			if (active && this.container)
				this.container.setActiveTab(this);
			this.fire("activeStateChanged", [active]);
		},

		setContainer: function(container) {
			this.container = container;
		}
	});

	Global.DockPanel = DockPanel;

})();