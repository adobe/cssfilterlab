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
                width = this.filterDockToggleEl.outerWidth(),
                height = this.filterDockToggleEl.outerHeight();
            this.filterDock.containerEl
                .css("left", offset.left + width / 2)
                .css("top", offset.top + height);

            this.filterDock.containerEl.show();
            this.filterDock.containerEl.before(this.outsideLayerEl);

            return false;
        },

        hideFilterDock: function() {
            this.filterDockToggleEl.removeClass("selected");
            this.outsideLayerEl.detach();
            this.filterDock.containerEl.hide();

            return false;
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