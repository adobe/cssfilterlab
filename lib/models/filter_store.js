(function() {
	
	function FilterStore(config) {
		FilterStore.super.call(this);
		this.config = config;
		this.availableFilters = [];
        this.availableFiltersByName = {};
	}

	Global.Utils.extend(FilterStore).from(Global.EventDispatcher);

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

	$.extend(FilterStore.prototype, {
		loadFilterConfigurations: function() {
            var self = this;
            $.each(this.config.filters, function(filterName, filterConfig) {
                filterConfig = fixConfig(filterName, filterConfig);
                self.availableFilters.push(filterConfig);
                self.availableFiltersByName["_" + filterName] = filterConfig;
                self.fire("filterAdded", [filterConfig]);
            });
            this.fire("filtersLoaded");
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
        }

	});

	Global.FilterStore = FilterStore;

})();