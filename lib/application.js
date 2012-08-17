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
        this.shaderEditorView = new Global.ShaderEditorView(this.filterList);
        this.activeFilterListView = new Global.ActiveFilterListView(this.filterList);
        this.filterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.shaderEditorView);
        this.cssCodeView = new Global.CSSCodeView(this.animation);
        this.presetStoreView = new Global.PresetStoreView(this.presets);

        this.containerDockPanel = new Global.DockPanel("Document");
        this.targetEl = $("#container").appendTo(this.containerDockPanel.el);

        this.dockView = new Global.DockView($("#dock-view"));

        this.dockView.add(this.filterStoreView.dockPanel)
                     .add(this.activeFilterListView.dockPanel)
                     .add(this.presetStoreView.dockPanel);

        this.dockView.add(this.containerDockPanel)
            .column.addContainer()
                     .add(this.cssCodeView.dockPanelCode)
                     .add(this.cssCodeView.dockPanelAnimationCode)
                     .add(this.timelineView.dockPanel);

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