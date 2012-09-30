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
            var filterConfigCallbacks = {
                filterConfigChanged: this.onFilterConfigChanged.bind(this, filter),
                filterConfigRemoved: this.onFilterConfigRemoved.bind(this, filter)
            };
            this.filterConfigCallbacksById["_" + filterName] = filterConfigCallbacks;

            filter.config.on("configChanged", filterConfigCallbacks.filterConfigChanged);
            filter.config.on("filterDeleted", filterConfigCallbacks.filterConfigRemoved);
            this.fire("filterAdded", [filter]);
            return filter;
        },

        removeFilter: function(filter) {
            var index = this.filters.indexOf(filter);
            if (index < 0)
                return;
            this.filters.splice(index, 1);
            console.log("removing " + filter.name);
            delete this.filtersById["_" + filter.name];
            var filterConfigCallbacks = this.filterConfigCallbacksById["_" + filter.name];
            filter.config.off("configChanged", filterConfigCallbacks.filterConfigChanged);
            filter.config.off("filterDeleted", filterConfigCallbacks.filterConfigRemoved);
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
                return filter.active && filter.config.isLoading !== true;
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
        },

        onFilterConfigRemoved: function(filter) {
            this.removeFilter(filter);
        }
    });


    Global.FilterList = FilterList;
})();
