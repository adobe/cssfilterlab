(function() {
    function Application() {
        this.config = new Global.Config();
        this.config.load(filterConfigs);

        this.fileSystem = new Global.FileSystem();
        this.filterStore = new Global.FilterStore(this.config);
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

        this.targetEl = $("#main");

        this.containerDockPanel = new Global.DockPanel("Document");
        this.targetEl.appendTo(this.containerDockPanel.el)
        
        console.log(this.containerDockPanel)

        this.dockView = new Global.DockView($("#app"));

        this.dockView.add(this.activeFilterListView.dockPanel)
                     // .add(this.presetStoreView.dockPanel)
                     .setIsDocumentArea()
                     .column.setWidth(350)
                     // .addContainer()
                     // .add(this.builtinFilterStoreView.dockPanel)
                     // .add(this.customFilterStoreView.dockPanel)
                     // .add(this.forkedFilterStoreView.dockPanel)
                     // .setHeight(window.innerHeight * 0.35);

        // hide the tabs for the "filters" DockContainer
        this.dockView.columns[0].items[0].removeTabs()
        
        this.dockView.add(this.containerDockPanel)
            .setIsDocumentArea()
            .removeTabs()
            .column.setIsDocumentArea().addClass('light').addHorizontalColumn()
                .setHeight(150)
                .add(this.cssCodeView.dockPanelCode)
                .add(this.cssCodeView.dockPanelAnimationCode)
                .setIsDocumentArea()
            .column.addContainer().add(this.timelineView.dockPanel);

        // Shader editor will later on add more panels when the first
        // filter is going to be customized.
        this.shaderEditorView.dockView = this.dockView;

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
        },

        onFiltersUpdated: function(cssFilters, filterCodeHtml, animationCodeHtml) {
            this.targetEl.css("-webkit-filter", cssFilters);
        }
    };

    $(function() {
        window.app = new Application();
    });

    Global.Application = Application;
})();