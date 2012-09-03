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
	
	function CSSCodeView(animation) {
		this.animation = animation;
		this.dockPanelCode = new Global.DockPanel("CSS Syntax");
        this.dockPanelAnimationCode = new Global.DockPanel("CSS Animation Syntax");
		this.filterCodeEl = $("#filter-code").appendTo(this.dockPanelCode.el);
        this.animationCodeEl = $("#animation-code").appendTo(this.dockPanelAnimationCode.el);
        this.animation.on("filtersUpdated", this.onFiltersUpdated.bind(this));
	}

	CSSCodeView.prototype = {
		NoFiltersAddedText: "No filters applied. Add a filter from the left panel to see the CSS syntax for it.",
        NoAnimationAddedText: "No keyframes applied. Add a filter from the left panel and change the values to see the CSS syntax for it.",

		onFiltersUpdated: function(cssFilters, filterCodeHtml, animationCodeHtml) {
            if (!filterCodeHtml.length)
                filterCodeHtml = this.NoFiltersAddedText;
            if (!animationCodeHtml.length)
                animationCodeHtml = this.NoAnimationAddedText;

            this.filterCodeEl.html(filterCodeHtml);
            this.animationCodeEl.html(animationCodeHtml);
        },
	}

	Global.CSSCodeView = CSSCodeView;

})();