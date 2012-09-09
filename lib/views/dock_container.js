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
	
	function DockContainer() {
		DockContainer.super.call(this);
		this.items = [];
		this.init();
	}

	Global.Utils.extend(DockContainer).from(Global.EventDispatcher);

	$.extend(DockContainer.prototype, {
		init: function() {
			this.el = $("<div />")
				.addClass("panel-container")
				.data("item", this);

			this.tabListEl = $("<div />")
				.addClass("panel-tab-list")
				.appendTo(this.el);
		},

		add: function(panel) {
			this.items.push(panel);
			this.tabListEl.append(panel.tabEl);
			this.el.append(panel.el);
			panel.setContainer(this);
			if (this.items.length == 1)
				panel.setActive(true);
			return this;
		},

		setHeight: function(height) {
			this.el.css("-webkit-box-flex", "0")
				   .css("-webkit-flex", 1)
				   .css("height", height);
			return this;
		},
		
		setActiveTab: function(tab) {
			$.each(this.items, function(i, item) {
				if (item == tab)
					return;
				item.setActive(false);
			});
		},

		setIsDocumentArea: function() {
			this.isDocumentArea = true;
			return this;
		},
		
		addClass: function(className) {
		    this.el.addClass(className)
		    return this;
		},
		
		removeTabs: function() {
		    this.tabListEl.remove()
		    return this;
		},

		setFixed: function() {
			this.isFixed = true;
			return this;
		}
	});

	Global.DockContainer = DockContainer;

})();