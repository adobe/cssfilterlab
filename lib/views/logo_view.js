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
    
    function LogoView(filterDock, filterStore) {
        this.filterDock = filterDock;
        this.filterStore = filterStore;
        this.filterDockToggleEl = $("#filter-store-toggle");
        this.importFilterEl = $("#import-filter");
        this.importFilterEl.click(this.onImportFilterClicked.bind(this));
        this.outsideLayerEl = $("<div />").addClass("clicks-catcher");
        this.dockPanel = new Global.DockPanel("Logo");
        this.logoEl = $("#logo").appendTo(this.dockPanel.el);
        this.init();
    }

    LogoView.prototype = {
        init: function() { 
            this.filterDock.containerEl.hide();
            this.outsideLayerEl.click(this.hideFilterDock.bind(this));
            this.filterDockToggleEl.click(this.showFilterDock.bind(this));
        },

        showFilterDock: function() {
            this.filterDockToggleEl.addClass("selected");

            var offset = this.filterDockToggleEl.offset(),
                width = this.filterDockToggleEl.outerWidth();
                height = this.filterDockToggleEl.outerHeight();
            this.filterDock.containerEl
                .css("left", offset.left + width / 2)
                .css("top", offset.top + height);

            this.filterDock.containerEl.show();
            this.filterDock.containerEl.before(this.outsideLayerEl);
        },

        hideFilterDock: function() {
            this.filterDockToggleEl.removeClass("selected");
            this.outsideLayerEl.detach();
            this.filterDock.containerEl.hide();
        },

        onImportFilterClicked: function() {
            var url = prompt("GitHub gist ID or url: ");
            if (!url)
                return;
            this.filterStore.loadFromGitHub(url, function(err, filter) {
                if (err)
                    console.error(err);
            });
        }
    }

    Global.LogoView = LogoView;

})();