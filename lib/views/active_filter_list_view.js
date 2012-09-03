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