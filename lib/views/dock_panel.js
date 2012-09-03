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