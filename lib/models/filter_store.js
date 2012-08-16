(function() {
	
	function FilterStore(config) {
		FilterStore.super.call(this);
		this.config = config;
		this.availableFilters = [];
        this.availableFiltersByName = {};
        this.lastFilterId = 0;
	}

	Global.Utils.extend(FilterStore).from(Global.EventDispatcher);

	
	$.extend(FilterStore.prototype, {
		loadFilterConfigurations: function() {
            var self = this;
            $.each(this.config.filters, function(filterName, filterConfig) {
                self.addFilter(new Global.FilterConfig(filterName, filterConfig));
            });
            this.fire("filtersLoaded");
        },

        addFilter: function(filterConfig) {
        	this.availableFilters.push(filterConfig);
            this.availableFiltersByName["_" + filterConfig.name] = filterConfig;
            this.fire("filterAdded", [filterConfig]);
        },

        filterConfigByName: function(filterName) {
        	return this.availableFiltersByName["_" + filterName];
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
            
            this.fire("filterUpdated", [filter]);
        },

        allocateNewName: function(filterConfig) {
            var name = filterConfig.name;
            while (this.filterConfigByName(name))
                name = filterConfig.name + (++this.lastFilterId);
            return name;
        },

        forkFilter: function(filterConfig) {
        	var newFilterConfig = new Global.FilterConfig(this.allocateNewName(filterConfig), filterConfig);
        	newFilterConfig.isFork = true;
        	this.addFilter(newFilterConfig);
        }

	});

	Global.FilterStore = FilterStore;

})();