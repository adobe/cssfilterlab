(function(){
	function FilterStoreView(filterStore, filterList, filterListView, shaderEditor, type) {
        this.type = this.filterTypes[type];
		this.filterStore = filterStore;
        this.filterStore.on("filterAdded", this.onFilterAdded.bind(this));
        
        this.filterList = filterList;
        this.filterListView = filterListView;
		this.shaderEditor = shaderEditor;

        this.dockPanel = new Global.DockPanel(this.type.name);

        this.filterStockListEl = $("<div />").addClass("filter-stock-list");
		this.filterStockEl = $("<div />")
                    .addClass("filter-stock")
                    .append(this.filterStockListEl)
                    .appendTo(this.dockPanel.el);

        this.filters = []; 
	}

	FilterStoreView.prototype = {

        filterTypes: {
            "builtins": {
                name: "Builtin filters",
                check: function(filterConfig) {
                    return filterConfig.isBuiltin;
                }
            },
            "custom": {
                name: "Custom filters",
                check: function(filterConfig) {
                    return !filterConfig.isBuiltin && !filterConfig.isFork;
                }
            },
            "forked": {
                name: "Forked custom filters",
                check: function(filterConfig) {
                    return !filterConfig.isBuiltin && filterConfig.isFork;
                }
            }
        },

        onFilterAdded: function(filterConfig, loadedFromPreset) {
            if (!this.type.check(filterConfig))
                return;

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
                            .text(filterConfig.label)
                            .appendTo(el);
                             
            var buttonBox = $("<div class='button-box'>");

            if (!filterConfig.isBuiltin) {
                if (!filterConfig.isFork) {
                    buttonBox.append($("<a href='#' />")
                        .addClass("customize-link button")
                        .text("Fork")
                        .click(function() {
                            self.forkFilter(filterConfig);
                        }));
                } else {
                    buttonBox.append($("<a href='#' />")
                        .addClass("customize-link button")
                        .text("Customize")
                        .click(function() {
                            self.customizeFilter(el, filterConfig);
                        }));
                }
            }

            filterConfig.on("configChanged", this.onFilterConfigChanged.bind(this, filterConfig, titleEl));

            buttonBox.append($("<a href='#' />")
                .addClass("add-link button cta")
                .text("Add")
                .click(function() {
                    self.filterListView.dockPanel.setActive(true);
                    var filter = self.filterList.addFilter(filterConfig);
                    filter.setActive(true);
                }));
            
            el.append(buttonBox)

            this.insertFilterElement(el, filterConfig);

            if (filterConfig.isFork && !loadedFromPreset) {
                this.dockPanel.setActive(true);
                el[0].scrollIntoView();
                el.hide().effect("highlight", {}, 400);
                this.customizeFilter(el, filterConfig);
            }
        },

		insertFilterElement: function(el, filterConfig) {
            this.filters.push(el);

            this.filters.sort(function(elA, elB) {
                var a = elA.data("filterConfig"),
                    b = elB.data("filterConfig");
                return a.name.localeCompare(b.name);
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

        customizeFilter: function(el, filterConfig) {
            $.each(this.filters, function(i, el) { el.removeClass("current"); });
            el.addClass("current");
            this.shaderEditor.loadFilter(filterConfig);
        },

        onFilterConfigChanged: function(filterConfig, titleEl) {
            titleEl.text(filterConfig.label);
        },
	};

	Global.FilterStoreView = FilterStoreView;
})();