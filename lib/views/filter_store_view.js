(function(){
	function FilterStoreView(filterStore, filterList, shaderEditor) {
		this.filterStore = filterStore;
        this.filterStore.on("filterAdded", this.onFilterAdded.bind(this));
        
        this.filterList = filterList;
		this.shaderEditor = shaderEditor;
		this.filterStockEl = $("#filter-stock");

        this.filters = [];
	}

	FilterStoreView.prototype = {

        onFilterAdded: function(filterConfig) {
            var self = this,
                el = $("<li />")
                    .addClass(filterConfig.isBuiltin ? "builtin-filter" : "custom-filter")
                    .append($("<span />")
                        .addClass("filter-label")
                        .text(filterConfig.name)
                        .click(function() {
                            var filter = self.filterList.addFilter(filterConfig);
                            filter.setActive(true);
                        }))
                        .data("filterConfig", filterConfig);

            this.insertFilterElement(el);

            if (!filterConfig.isBuiltin) {
                el.append($("<span />")
                    .addClass("customize-link")
                    .text("Customize")
                    .click(function() {
                        self.customizeFilter(filterConfig)
                    }));
            }
        },

		insertFilterElement: function(el) {
            this.filters.push(el);
			
            // Order by the builtin filters first.
            this.filters.sort(function(elA, elB) {
                var a = elA.data("filterConfig"),
                    b = elB.data("filterConfig");
                if (a.isBuiltin == b.isBuiltin)
                    return a.name.localeCompare(b.name);
                return a.isBuiltin ? -1 : 1;
            });

            var index = this.filters.indexOf(el);
            if (index == this.filters.length - 1)
                this.filterStockEl.append(el);
            else
                this.filters[index + 1].before(el);
        },

        customizeFilter: function(filterConfig) {
            this.shaderEditor.loadFilter(filterConfig);
        }
	};

	Global.FilterStoreView = FilterStoreView;
})();