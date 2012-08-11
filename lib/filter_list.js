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
                container.append(item);
            });
            this.filters = filters;
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

        toggleShader: function(shaderName, toggle) {
            var shader = shadersByName[shaderName];
            var selected = shader.el.hasClass("current");
            
            if (toggle !== undefined) {
                if (toggle == selected)
                    return;
                selected = !toggle;
            } else {
                // Only trigger an update when the user clicked a shader.
                triggerStorageUpdate();
            }
            
            if (!selected)
                shader.el.addClass('current').children('.config').slideDown();
            else
                shader.el.removeClass('current').children('.config').slideUp();
            updateFilters();
        },

        setSource: function(keyframe) {
            this.keyframe = keyframe;
            var source = keyframe.value;
            $.each(this.filters, function(i, filter) {
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