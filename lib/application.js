(function() {
    function Application() {
        this.config = new Global.Config();
        this.config.load(filterConfigs);

        this.fileSystem = new Global.FileSystem();
        this.filterList = new Global.FilterList(this.config);
        this.animation = new Global.Animation(this.filterList);
        this.presets = new Global.PresetStore(this.fileSystem, this.animation);

        this.timelineView = new Global.TimelineView(this.animation);
        this.shaderEditorView = new Global.ShaderEditorView(this.filterList);
        this.activeFilterListView = new Global.ActiveFilterListView(this.filterList, this.shaderEditorView);
        this.availableFilterListView = new Global.AvailableFilterListView(this.filterList, this.shaderEditorView);
        this.cssCodeView = new Global.CSSCodeView(this.animation);
        this.toolsPanelView = new Global.ToolsPanelView(this.timelineView);
        this.presetStoreView = new Global.PresetStoreView(this.presets);

        this.targetEl = $("#container");

        this.init();

        // Make sure the filters are up to date after all the events are set up.
        this.animation.update();
    }
    
    Application.prototype = {
        init: function() {
            // Force a 3d layer in order to run filters in GPU.
            this.targetEl.css("-webkit-transform", "translate3d(0,0,0)");
            this.animation.on("filtersUpdated", this.onFiltersUpdated.bind(this));
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