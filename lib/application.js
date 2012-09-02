(function() {
    function Application() {
        $("#loading").remove();
        this.mainViewEl = $("#main-view").show();
        
        this.config = new Global.Config();
        this.config.load(filterConfigs);

        this.fileSystem = new Global.LocalStorage();
        this.filterStore = new Global.FilterStore(this.config, this.fileSystem);
        this.filterList = new Global.FilterList(this.filterStore);
        this.animation = new Global.Animation(this.filterList);
        this.presets = new Global.PresetStore(this.fileSystem, this.filterStore, this.animation);

        this.timelineView = new Global.TimelineView(this.animation);
        this.shaderEditorView = new Global.ShaderEditorView(this.filterStore);
        this.activeFilterListView = new Global.ActiveFilterListView(this.filterList);
        
        this.builtinFilterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.activeFilterListView, this.shaderEditorView, "builtins");
        this.customFilterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.activeFilterListView, this.shaderEditorView, "custom");
        this.forkedFilterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.activeFilterListView, this.shaderEditorView, "forked");

        this.cssCodeView = new Global.CSSCodeView(this.animation);
        this.presetStoreView = new Global.PresetStoreView(this.presets);

        this.containerDockPanel = new Global.DockPanel("Document");
        $("#main").appendTo(this.containerDockPanel.el)
       
        this.dockView = new Global.DockView($("#app"));
        this.filterDock = new Global.DockView($("#filter-dock")); 

        this.logoView = new Global.LogoView(this.filterDock);

        $("#components").remove();

        this.dockView
            .addVerticalColumn()
                .addContainer()
                    .setFixed()
                    .setHeight(45)
                    .add(this.logoView.dockPanel)
                    .removeTabs()
                .column
                .addContainer()
                    .add(this.activeFilterListView.dockPanel)
                    .setIsDocumentArea()
                    .removeTabs()
                    .column.setWidth(350)

        this.dockView
            .addVerticalColumn()
                .addContainer()
                    .setFixed()
                    .setHeight(45)
                    .add(this.presetStoreView.dockPanel)
                    .removeTabs()
                    .column
                .addContainer()
                    .add(this.containerDockPanel)
                    .setIsDocumentArea()
                    .removeTabs()
                .column
                    .setIsDocumentArea().addClass('light').addHorizontalColumn()
                    .setHeight(150)
                    .add(this.cssCodeView.dockPanelCode)
                    .add(this.cssCodeView.dockPanelAnimationCode)
                    .setIsDocumentArea()
                .column.addContainer().add(this.timelineView.dockPanel);

        // Shader editor will later on add more panels when the first
        // filter is going to be customized.
        this.shaderEditorView.dockView = this.dockView;
        
        this.filterDock.add(this.builtinFilterStoreView.dockPanel)
                        .add(this.customFilterStoreView.dockPanel)
                        .add(this.forkedFilterStoreView.dockPanel)

        this.targetEl = $("#container");

        this.browserPopupEl = $("#browser-popup").detach();

        this.init();
    }
    
    Application.prototype = {
        init: function() {
            // Force a 3d layer in order to run filters in GPU.
            this.targetEl.css("-webkit-transform", "translate3d(0,0,0)");
            this.animation.on("filtersUpdated", this.onFiltersUpdated.bind(this));
            
            // Make sure the filters are up to date after all the events are set up.
            this.animation.update();
            this.filterStore.loadFilterConfigurations();

            this.checkFeatures();
        },

        onFiltersUpdated: function(cssFilters, filterCodeHtml, animationCodeHtml) {
            this.targetEl.css("-webkit-filter", cssFilters);
        },
        
        showBrowserCheckPopup: function() {
            this.mainViewEl.hide();
            this.browserPopupEl.appendTo(document.body).show();
        },

        prefixes: ["", "-webkit-", "-moz-", "-ms-", "-o-"],
        
        checkFeatureWithPropertyPrefix: function(property, value) {
            var div = $("<div />");
            for (var i = 0; i < this.prefixes.length; ++i) {
                var prefixedProperty = this.prefixes[i] + property;
                if (div.css(prefixedProperty, value).css(prefixedProperty) == value)
                    return true;
            }
            return false;
        },

        checkFeatureWithValuePrefix: function(property, value) {
            var div = $("<div />");
            for (var i = 0; i < this.prefixes.length; ++i) {
                var prefixedValue = this.prefixes[i] + value;
                if (div.css(property, prefixedValue).css(property) == prefixedValue)
                    return true;
            }
            return false;
        },

        checkFeatures: function() {
            if (!this.checkFeatureWithValuePrefix("display", "flex")
                && !this.checkFeatureWithValuePrefix("display", "box")
                && !this.checkFeatureWithPropertyPrefix("filter", "sepia(100%)")) {
                this.showBrowserCheckPopup();
            }
            this.supportsCustomFilters = this.checkFeatureWithPropertyPrefix("filter", "custom(url(test))");
            this.supportsMixCustomFilters = this.checkFeatureWithPropertyPrefix("filter", "custom(none mix(url(test)))");
        }

    };

    $(function() {
        var app = window.app = new Application();
    });

    Global.Application = Application;

})();