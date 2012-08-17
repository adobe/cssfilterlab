(function(){
	function FilterStoreView(filterStore, filterList, filterListView, shaderEditor) {
		this.filterStore = filterStore;
        this.filterStore.on("filterAdded", this.onFilterAdded.bind(this));
        
        this.filterList = filterList;
        this.filterListView = filterListView;
		this.shaderEditor = shaderEditor;

        this.filterStockListEl = $("#filter-stock-list");

        this.dockPanel = new Global.DockPanel("Filter Store");
		this.filterStockEl = $("#filter-stock").appendTo(this.dockPanel.el);

        this.filters = [];
	}

	FilterStoreView.prototype = {

        onFilterAdded: function(filterConfig) {
            var self = this;
            
            var el = $("<div />")
                    .addClass("filter-item")
                    .addClass(filterConfig.isBuiltin ? "builtin-filter" : "custom-filter")
                    .data("filterConfig", filterConfig);
            
            if (filterConfig.isFork)
                el.addClass("forked-filter");

            var cssPreview = filterConfig.generatePreviewCode(),
                previewEl = $("<div />")
                            .addClass("filter-preview")
                            .css("-webkit-filter", cssPreview)
                            .appendTo(el);

            var titleEl = $("<div />")
                            .addClass("filter-label")
                            .text(filterConfig.name)
                            .appendTo(el);

            el.append($("<button />")
                .addClass("add-link")
                .text("Add")
                .click(function() {
                    self.filterListView.dockPanel.setActive(true);
                    var filter = self.filterList.addFilter(filterConfig);
                    filter.setActive(true);
                }));

            if (!filterConfig.isBuiltin) {
                if (!filterConfig.isFork) {
                    el.append($("<button />")
                        .addClass("customize-link")
                        .text("Fork")
                        .click(function() {
                            self.forkFilter(filterConfig)
                        }));
                } else {
                    el.append($("<button />")
                        .addClass("customize-link")
                        .text("Customize")
                        .click(function() {
                            self.customizeFilter(filterConfig)
                        }));
                }
            }

            this.insertFilterElement(el, filterConfig);
        },

		insertFilterElement: function(el, filterConfig) {
            this.filters.push(el);

            if (filterConfig.isFork) {
                this.filterStockListEl.append(el);
                el[0].scrollIntoView();
                el.hide().effect("highlight", {}, 100);
                return;
            }
			
            // Order by the builtin filters first.
            this.filters.sort(function(elA, elB) {
                var a = elA.data("filterConfig"),
                    b = elB.data("filterConfig");
                if (a.isBuiltin == b.isBuiltin) {
                    if (!a.isBuiltin && a.isFork != b.isFork)
                        return a.isFork ? 1 : -1;
                    return a.name.localeCompare(b.name);
                }
                return a.isBuiltin ? -1 : 1;
            });

            var index = this.filters.indexOf(el);
            if (index == this.filters.length - 1)
                this.filterStockListEl.append(el);
            else
                this.filters[index + 1].before(el);
        },

        forkFilter: function(filterConfig) {
            this.filterStore.forkFilter(filterConfig);
        },

        customizeFilter: function(filterConfig) {
            this.shaderEditor.loadFilter(filterConfig);
        }
	};

	Global.FilterStoreView = FilterStoreView;
})();