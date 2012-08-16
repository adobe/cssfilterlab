(function(){
	function FilterStoreView(filterStore, filterList, shaderEditor) {
		this.filterStore = filterStore;
        this.filterList = filterList;
		this.shaderEditor = shaderEditor;
		this.filterStock = $("#filter-stock");
		this.populateFiltersList();
	}

	FilterStoreView.prototype = {
		populateFiltersList: function() {
			var self = this;
			// Order by the builtin filters first.
            this.filterStore.availableFilters.sort(function(a, b) {
                if (a.isBuiltin == b.isBuiltin)
                    return a.name.localeCompare(b.name);
                return a.isBuiltin ? -1 : 1;
            });
            $.each(this.filterStore.availableFilters, function(i, filterConfig) {
                var el = $("<li />")
                    .addClass(filterConfig.isBuiltin ? "builtin-filter" : "custom-filter")
                    .append($("<span />")
                        .addClass("filter-label")
                        .text(filterConfig.name)
                        .click(function() {
                            var filter = self.filterList.addFilter(filterConfig);
                            filter.setActive(true);
                        }))
                    .appendTo(self.filterStock);

                if (!filterConfig.isBuiltin) {
                    el.append($("<span />")
                        .addClass("customize-link")
                        .text("Customize")
                        .click(function() {
                            self.customizeFilter(filterConfig)
                        }));
                }
            });
        },

        customizeFilter: function(filterConfig) {
            this.shaderEditor.loadFilter(filterConfig);
        }
	};

	Global.FilterStoreView = FilterStoreView;
})();