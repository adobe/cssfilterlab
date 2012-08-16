(function(){

    function FilterList(filterStore) {
        FilterList.super.call(this);
        this.filterStore = filterStore;

        this.lastFilterId = 0;
        this.filters = [];
        this.filtersById = {};
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
            this.fire("filterAdded", [filter]);
            return filter;
        },

        removeFilter: function(filter) {
            var index = this.filters.indexOf(filter);
            if (index < 0)
                return;
            this.filters.splice(index, 1);
            delete this.filtersById["_" + filter.name];
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
                var filterConfig = self.filterStore.filterConfigByName(filter.type);
                if (!filterConfig)
                    return;
                var filterItem = self.addFilter(filterConfig, filter.name);
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
                values[filter.name] = filter.defaultValues();
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
        }
    });
    

    Global.FilterList = FilterList;
})();