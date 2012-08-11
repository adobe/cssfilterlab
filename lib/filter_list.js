(function(){

    function FilterList(config, container) {
        this.config = config;
        this.container = container;
        this.generateFilterItems();
    }

    FilterList.prototype = {
        generateFilterItems: function() {
            var self = this,
                filters = [],
                container = this.container;
            container.empty();
            $.each(this.config.filters, function(filterName, filterConfig) {
                var filter = new Global.Filter(self, filterName, filterConfig);
                filters.push(filter);
                var item = filter.generateFilterItem();
                $(item).data("filter", filter);
                container.append(item);
            });
            this.filters = filters;
            this.makeDragable();
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