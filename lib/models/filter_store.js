(function() {
	
	function FilterStore(config) {
		FilterStore.super.call(this);
		this.config = config;
		this.availableFilters = [];
        this.availableFiltersByName = {};
        this.lastFilterId = 0;
	}

	Global.Utils.extend(FilterStore).from(Global.EventDispatcher);

	function isBuiltin(config) {
        var type = config.type ? config.type.fn : "custom";
        return type != "custom";
    }

    function fixConfig(filterName, jsonConfig) {
    	var config = Global.Utils.clone(jsonConfig);
    	config.original = jsonConfig;
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

	$.extend(FilterStore.prototype, {
		loadFilterConfigurations: function() {
            var self = this;
            $.each(this.config.filters, function(filterName, filterConfig) {
                self.addFilter(fixConfig(filterName, filterConfig));
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
        	var newFilterConfig = fixConfig(this.allocateNewName(filterConfig), filterConfig);
        	newFilterConfig.isFork = true;
        	this.addFilter(newFilterConfig);
        }

	});

	Global.FilterStore = FilterStore;

})();