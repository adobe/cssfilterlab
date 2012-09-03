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