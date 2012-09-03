(function() {
    
    function LogoView(filterDock, filterStore) {
        this.filterDock = filterDock;
        this.filterStore = filterStore;
        this.filterDockToggleEl = $("#filter-store-toggle");
        this.importFilterEl = $("#import-filter");
        this.importFilterEl.click(this.onImportFilterClicked.bind(this));
        this.outsideLayerEl = $("<div />").addClass("clicks-catcher");
        this.dockPanel = new Global.DockPanel("Logo");
        this.logoEl = $("#logo").appendTo(this.dockPanel.el);
        this.init();
    }

    LogoView.prototype = {
        init: function() { 
            this.filterDock.containerEl.hide();
            this.outsideLayerEl.click(this.hideFilterDock.bind(this));
            this.filterDockToggleEl.click(this.showFilterDock.bind(this));
        },

        showFilterDock: function() {
            this.filterDockToggleEl.addClass("selected");

            var offset = this.filterDockToggleEl.offset(),
                width = this.filterDockToggleEl.outerWidth();
                height = this.filterDockToggleEl.outerHeight();
            this.filterDock.containerEl
                .css("left", offset.left + width / 2)
                .css("top", offset.top + height);

            this.filterDock.containerEl.show();
            this.filterDock.containerEl.before(this.outsideLayerEl);
        },

        hideFilterDock: function() {
            this.filterDockToggleEl.removeClass("selected");
            this.outsideLayerEl.detach();
            this.filterDock.containerEl.hide();
        },

        onImportFilterClicked: function() {
            var url = prompt("GitHub gist ID or url: ");
            if (!url)
                return;
            this.filterStore.loadFromGitHub(url, function(err, filter) {
                if (err)
                    console.error(err);
            });
        }
    }

    Global.LogoView = LogoView;

})();