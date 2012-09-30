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

(function(){

    function ActiveFilterListView(filterList) {
        this.filterList = filterList;
        this.filterList.on("filterAdded", this.onFilterAdded.bind(this));
        this.filterList.on("filterRemoved", this.onFilterRemoved.bind(this));

        this.filterMessageEl = $("#filter-list-empty");

        this.container = $("#filter-list");

        this.dockPanel = new Global.DockPanel("Active Filters");
        this.scrollContainer = $("#active-filters").appendTo(this.dockPanel.el);

        this.filterItemsViewsByName = {};

        this.makeDragable();
        this.updateFilterCount();
    }

    ActiveFilterListView.prototype = {
        updateFilterCount: function() {
            this.filterMessageEl.toggle(!this.filterList.filters.length);
        },

        makeDragable: function() {
            var self = this;
            this.scrollContainer.sortable({
                distance: 15,
                axis: 'y',
                items: 'li',
                handle: '.dragpoint',
                scroll: true,
                start: function(event, ui) {
                    ui.helper.addClass("dragging");
                },
                beforeStop: function(event, ui) {
                    ui.helper.removeClass("dragging");
                },
                update: function(event, ui) {
                    $(this).find("li").each(function (index, el) {
                        var filterItemView = $(el).data("filterItemView");
                        if (filterItemView)
                            filterItemView.filter.order = index;
                    });
                    self.filterList.updateFiltersOrder();
                }
            });
        },

        onFilterAdded: function(filter) {
            var itemView = new Global.FilterItemView(filter);
            this.filterItemsViewsByName["_" + filter.name] = itemView;
            this.container.append(itemView.el);
            this.updateFilterCount();
            this.scrollContainer.scrollTop(this.container.outerHeight() + 1000);
        },

        onFilterRemoved: function(filter, useAnimation) {
            var self = this,
                filterItemView = this.filterItemsViewsByName["_" + filter.name];
            if (!filterItemView)
                return;
            if (useAnimation) {
                filterItemView.el.slideUp(100, function() {
                    filterItemView.el.remove();
                    self.updateFilterCount();
                });
            } else {
                filterItemView.el.remove();
                this.updateFilterCount();
            }
        }
    };

    Global.ActiveFilterListView = ActiveFilterListView;

})();
