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

    function FilterList(filterStore) {
        FilterList.super.call(this);
        this.filterStore = filterStore;

        this.lastFilterId = 0;
        this.filters = [];
        this.filtersById = {};
        this.filterConfigCallbacksById = {};
    }

    Global.Utils.extend(FilterList).from(Global.EventDispatcher);

    $.extend(FilterList.prototype, {
        updateFiltersOrder: function() {
            this.filters.sort(function(a, b) { return a.order - b.order; });
            this.fire("filtersOrderChanged");
        },

        allocateNewName: function(filterConfig) {
            var name = filterConfig.name;
            while (this.filterByName(name))
                name = filterConfig.name + (++this.lastFilterId);
            return name;
        },

        filterByName: function(name) {
            return this.filtersById["_" + name];
        },

        addFilter: function(filterConfig, filterName) {
            if (!filterName)
                filterName = this.allocateNewName(filterConfig);
            var filter = new Global.Filter(filterName, filterConfig);
            filter.on("valuesUpdated", this.onFilterValuesUpdated.bind(this, filter));
            filter.on("filterRemoved", this.removeFilter.bind(this, filter));
            filter.on("filterStateChanged", this.onFilterStateChanged.bind(this, filter));
            this.filters.push(filter);
            this.filtersById["_" + filterName] = filter;
            var filterConfigChanged = this.onFilterConfigChanged.bind(this, filter);
            this.filterConfigCallbacksById["_" + filterName] = filterConfigChanged;
            filter.config.on("configChanged", filterConfigChanged);
            this.fire("filterAdded", [filter]);
            return filter;
        },

        removeFilter: function(filter) {
            var index = this.filters.indexOf(filter);
            if (index < 0)
                return;
            this.filters.splice(index, 1);
            delete this.filtersById["_" + filter.name];
            filter.config.off("configChanged", this.filterConfigCallbacksById["_" + filter.name]);
            delete this.filterConfigCallbacksById["_" + filter.name];
            this.fire("filterRemoved", [filter, /*animation=*/true]);
        },

        reload: function(filters) {
            var self = this,
                oldFilters = this.filters;
            this.lastFilterId = 0;
            this.filters = [];
            this.filtersById = {};
            $.each(oldFilters, function(i, filter) {
                self.fire("filterRemoved", [filter, /*animation=*/false]);
            });
            $.each(filters, function(i, filter) {
                var filterConfig = self.filterStore.loadedOrPendingFilterByName(filter.type),
                    filterItem = self.addFilter(filterConfig, filter.name);
                if (filter.active)
                    filterItem.setActive(true);
            });
        },

        activeFilters: function() {
            return $.grep(this.filters, function(filter) {
                return filter.active;
            });
        },

        defaultValues: function() {
            var values = {};
            $.each(this.filters, function(i, filter) {
                values[filter.name] = filter.config.defaultValues();
            });
            return values;
        },

        setSource: function(keyframe) {
            this.keyframe = keyframe;
            var source = keyframe.value;
            $.each(this.filters, function(i, filter) {
                if (!filter.active)
                    return;
                filter.setSource(source[filter.name]);
            });
        },

        onFilterValuesUpdated: function(filter, paramName) {
            this.fire("keyframeUpdated", [this.keyframe, filter, paramName]);
        },

        onFilterStateChanged: function(filter) {
            this.fire("filterStateChanged", [filter]);
        },

        onFilterConfigChanged: function(filter, configChanges) {
            this.fire("filterConfigChanged", [filter, configChanges]);
        }
    });
    

    Global.FilterList = FilterList;
})();