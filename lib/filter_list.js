(function(){

    function FilterList(config, container) {
        this.config = config;
        this.container = container;
        this.lastFilterId = 0;
        this.filters = [];
        this.makeDragable();
        this.generateFilterItems();
    }

    FilterList.prototype = {
        generateFilterItems: function() {
            var self = this;
            $.each(this.config.filters, function(filterName, filterConfig) {
                if (!filterConfig.name)
                    filterConfig.name = filterName;
                self.addFilter(filterConfig);
            });
        },

        allocateNewName: function(filterConfig) {
            return filterConfig.name + (++this.lastFilterId);;
        },

        addFilter: function(filterConfig, filterName) {
            if (!filterName)
                filterName = this.allocateNewName(filterConfig);
            var filter = new Global.Filter(this, filterName, filterConfig);
            this.filters.push(filter);
            
            var itemEl = filter.generateFilterItem();
            $(itemEl).data("filter", filter);
            this.container.append(itemEl);
            
            if (this.animation) {
                this.animation.addFilterDefaultValues();
                this.animation.update();
            }
        },

        removeFilter: function(filter) {
            var index = this.filters.indexOf(filter);
            if (!index)
                return;
            this.filters.splice(index, 1);
            if (this.animation) {
                this.animation.removeFilterDefaultValues();
                this.animation.update();
            }
        },

        makeDragable: function() {
            var self = this;
            this.container.sortable({
                distance: 15,
                axis: 'y',
                items: 'li',
                handle: '.dragpoint',
                start: function(event, ui) {
                    ui.helper.addClass("dragging");
                },
                beforeStop: function(event, ui) {
                    ui.helper.removeClass("dragging");
                },            
                update: function(event, ui) {
                    $(this).find("li").each(function (index, el) {
                        $(el).data("filter").order = index;
                    });
                    self.filters.sort(function(a, b) { return a.order - b.order; });
                    if (self.animation)
                        self.animation.updateFilters();
                }
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
            if (!this.animation || !this.keyframe)
                return;
            this.animation.keyframeUpdated(this.keyframe, filter, paramName);
        },

        onFilterStateChange: function(filter) {
            if (this.animation)
                this.animation.onFilterStateChange(filter);
        }
    }
    

    Global.FilterList = FilterList;
})();