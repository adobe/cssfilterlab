(function(){

    function FilterList(config, shaderEditor) {
        FilterList.super.call(this);
        this.config = config;
        this.lastFilterId = 0;
        this.filters = [];
        this.filtersById = {};
        
        this.loadFilterConfigurations();
    }

    Global.Utils.extend(FilterList).from(Global.EventDispatcher);

    function isBuiltin(config) {
        var type = config.type ? config.type.fn : "custom";
        return type != "custom";
    }

    function fixConfig(filterName, config) {
        config.original = Global.Utils.clone(config);
        if (!config.name)
            config.name = filterName;
        config.isBuiltin = isBuiltin(config);
        $.each(config.params, function (name) {
            var filterParam = config.config[name],
                type = filterParam.type || 'range',
                mixer = (type == 'hidden' || type == 'unknown') ?
                        Global.mixers.dontMix :
                        Global.mixers.mixNumber,
                generator = filterParam.generator || "identity";
            if (filterParam.mixer) {
                if (filterParam.mixer.fn)
                    mixer = Global.mixers[filterParam.mixer.fn].apply(config, filterParam.mixer.params);
                else
                    mixer = Global.mixers[filterParam.mixer];
            }
            filterParam.mixer = mixer;
            filterParam.generator = Global.CSSGenerators[generator] || Global.CSSGenerators.identity;
        });
        return config;
    }

    $.extend(FilterList.prototype, {
        loadFilterConfigurations: function() {
            var self = this;
            this.availableFilters = [];
            this.availableFiltersByName = {};
            $.each(this.config.filters, function(filterName, filterConfig) {
                filterConfig = fixConfig(filterName, filterConfig);
                self.availableFilters.push(filterConfig);
                self.availableFiltersByName["_" + filterName] = filterConfig;
            });
        },

        filterUpdate: function(filter, type, value) {
            switch (type) {
                case "vertex":
                case "fragment":
                    this.updateFilterShader(filter, type, value);
                    break;
            }
        },

        updateFilterShader: function(filter, type, value) {
            var blob = new Blob([value]),
                self = this;
            /*    reader = new FileReader(),
                
            reader.onload = function() {
                filter["edited_" + type] = reader.result;
                if (self.animation)
                    self.animation.updateFilters();
            }
            reader.readAsDataURL(blob);*/

            filter["edited_" + type] = webkitURL.createObjectURL(blob);
            if (self.animation)
                self.animation.updateFilters();
        },

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
            var filter = new Global.Filter(this, filterName, filterConfig);
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
            this.fire("filterRemoved", [filter]);
        },

        reload: function(filters) {
            var self = this,
                oldFilters = this.filters;
            this.lastFilterId = 0;
            this.filters = [];
            this.filtersById = {};
            $.each(oldFilters, function(i, filter) {
                self.fire("filterRemoved", [filter]);
            });
            $.each(filters, function(i, filter) {
                var filterConfig = self.availableFiltersByName["_" + filter.type];
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

        valuesUpdated: function(filter, paramName) {
            this.fire("keyframeUpdated", [this.keyframe, filter, paramName]);
        },

        onFilterStateChange: function(filter) {
            this.fire("filterStateChanged", [filter]);
        }
    });
    

    Global.FilterList = FilterList;
})();