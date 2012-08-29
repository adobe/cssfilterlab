(function() {
    function Application() {
        this.config = new Global.Config();
        this.config.load(filterConfigs);

        this.fileSystem = new Global.FileSystem();
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

        this.dockView
            .addColumn().addHorizontalColumn()
                .setFixed()
                .setHeight(45)
                .add(this.logoView.dockPanel)
                .removeTabs()
                .column.parent
            .addContainer()
                .add(this.activeFilterListView.dockPanel)
                .setIsDocumentArea()
                .removeTabs()
                .column.setWidth(350)

        this.dockView
            .addColumn().addHorizontalColumn()
                .setFixed()
                .setHeight(45)
                .add(this.presetStoreView.dockPanel)
                .removeTabs()
                .column.parent
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

        this.targetEl = $("#scene");

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

            // Reposition the filter store
            $("body").on("dockViewResized", null, {scope: this}, this.onDockResize)
            
            // Bootstrap filter store position
            this.onDockResize.call(this, {data: {scope: this}})
        },

        onFiltersUpdated: function(cssFilters, filterCodeHtml, animationCodeHtml) {
            this.targetEl.css("-webkit-filter", cssFilters);
        },
        
        onDockResize: function(e){
            $(e.data.scope.filterDock.containerEl).css("left", $(e.data.scope.activeFilterListView.dockPanel.container.el).css("width"))                            
        }
        
    };

    $(function() {
        window.app = new Application();
    });

    Global.Application = Application;
})();