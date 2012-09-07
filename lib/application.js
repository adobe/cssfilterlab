/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

(function() {
    function Application() {
        this.checkFeatures();

        $("#loading").remove();
        this.mainViewEl = $("#main-view").show();

        this.helpButtonEl = $("#help-link");
        this.helpPopupCloseEl = $("#help-popup-close");
        this.helpPopupCloseEl.click(this.onHelpPopupCloseClicked.bind(this));
        this.helpButtonEl.click(this.onHelpClicked.bind(this));
        this.helpPopupEl = $("#help-popup").detach();

        this.browserPopupCloseEl = $("#browser-popup-close");
        this.browserPopupCloseEl.click(this.onBrowserPopupCloseClicked.bind(this));
        this.browserPopupEl = $("#browser-popup").detach();
        
        this.config = new Global.Config();
        this.config.load(filterConfigs);
        this.github = new Global.GitHub();

        this.fileSystem = new Global.LocalStorage();
        this.filterStore = new Global.FilterStore(this.config, this.fileSystem, this.github);
        this.filterList = new Global.FilterList(this.filterStore);
        this.animation = new Global.Animation(this.filterList, this.filterStore);
        this.presets = new Global.PresetStore(this.fileSystem, this.filterStore, this.animation);
        
        this.timelineView = new Global.TimelineView(this.animation);
        this.shaderEditorView = new Global.ShaderEditorView(this.filterStore, this.github);
        this.activeFilterListView = new Global.ActiveFilterListView(this.filterList);
        
        this.builtinFilterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.activeFilterListView, this.shaderEditorView, "builtins");
        this.customFilterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.activeFilterListView, this.shaderEditorView, "custom");
        this.forkedFilterStoreView = new Global.FilterStoreView(this.filterStore, this.filterList, this.activeFilterListView, this.shaderEditorView, "forked");

        this.cssCodeView = new Global.CSSCodeView(this.animation);
        this.presetStoreView = new Global.PresetStoreView(this.presets);

        this.dockView = new Global.DockView($("#app"));
        this.filterDock = new Global.DockView($("#filter-dock")); 

        this.logoView = new Global.LogoView(this.filterDock, this.filterStore);

        this.containerDockPanel = new Global.DockPanel("Document");
        this.targetEl = $("#container");
        $("#main").appendTo(this.containerDockPanel.el)

        this.unsupportedPopupEl = $("#filters-not-supported-popup").detach();

        // At this point we are finished with loading HTML snippets, so we can remove the components element.
        $("#components").remove();

        this.init();
        this.checkFirstTimeLoad();
    }
    
    Application.prototype = {
        init: function() {
            this.dockView
                .addVerticalColumn()
                    .setMinSize(350)
                    .setWidth(350)
                    .addContainer()
                        .setFixed()
                        .setHeight(50)
                        .add(this.logoView.dockPanel)
                        .removeTabs()
                    .column
                    .addContainer()
                        .add(this.activeFilterListView.dockPanel)
                        .setIsDocumentArea()
                        .removeTabs();

            this.dockView
                .addVerticalColumn()
                    .setMinSize(400)
                    .setIsDocumentArea().addClass('light')
                    .addContainer()
                        .setFixed()
                        .setHeight(50)
                        .add(this.presetStoreView.dockPanel)
                        .removeTabs()
                        .column
                    .addContainer()
                        .add(this.containerDockPanel)
                        .setIsDocumentArea()
                        .removeTabs()
                    .column.addContainer()
                            .setHeight(150)
                            .add(this.cssCodeView.dockPanelCode)
                            .add(this.cssCodeView.dockPanelAnimationCode)
                    .column.addContainer(true)
                            .setFixed()
                            .setHeight(50)
                            .add(this.timelineView.dockPanel)
                            .removeTabs();

            // Shader editor will later on add more panels when the first
            // filter is going to be customized.
            this.shaderEditorView.dockView = this.dockView;
            
            this.filterDock.add(this.builtinFilterStoreView.dockPanel)
                            .add(this.customFilterStoreView.dockPanel)
                            .add(this.forkedFilterStoreView.dockPanel);

            // Force a 3d layer in order to run filters in GPU.
            this.targetEl.css("-webkit-transform", "translate3d(0,0,0)");
            this.animation.on("filtersUpdated", this.onFiltersUpdated.bind(this));
            
            // Make sure the filters are up to date after all the events are set up.
            this.animation.update();
            this.filterStore.loadFilterConfigurations();
            this.setupFilterSelectListeners();

            this.checkMinimumFeatures();
        },

        onFiltersUpdated: function(cssFilters, filterCodeHtml, animationCodeHtml) {
            this.targetEl.css("-webkit-filter", cssFilters);
        },
        
        //
        // Feature detection:
        //

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
            this.supportsFlex = this.checkFeatureWithValuePrefix("display", "flex") || this.checkFeatureWithValuePrefix("display", "box");
            this.supportsFilters = this.checkFeatureWithPropertyPrefix("filter", "sepia(100%)");
            this.supportsCustomFilters = this.checkFeatureWithPropertyPrefix("filter", "custom(none mix(url(http://www.example.com/)))");
        },

        checkMinimumFeatures: function() {
            if (!this.supportsFlex || !this.supportsFilters)
                this.showBrowserCheckPopup();

            if (!this.supportsCustomFilters) {
                this.unsupportedPopupEl.find(".filters-not-supported-help").click(this.showCustomFilterCheckPopup.bind(this));
                this.customFilterStoreView.insertUnsupportedPopup(this.unsupportedPopupEl);
                this.forkedFilterStoreView.insertUnsupportedPopup(this.unsupportedPopupEl);
            }
        },

        showBrowserCheckPopup: function() {
            this.mainViewEl.hide();
            this.browserPopupCloseEl.hide();
            this.browserPopupEl.appendTo(document.body).show();
        },

        showCustomFilterCheckPopup: function() {
            this.browserPopupCloseEl.show();
            this.browserPopupEl.appendTo(document.body).show();
        },

        onHelpClicked: function() {
            this.helpPopupEl.appendTo(document.body).show();
        },

        onHelpPopupCloseClicked: function() {
            this.helpPopupEl.detach();
            if (this.firstRun) {
                this.fileSystem.save("first_run", "no");
                this.firstRun = false;
            }
        },

        onBrowserPopupCloseClicked: function() {
            this.browserPopupEl.detach();
        },
        
        setupFilterSelectListeners: function(){
            var self = this;
            $.each([this.builtinFilterStoreView, this.customFilterStoreView, this.forkedFilterStoreView], function(index, view){
                view.on("filterSelected", function(){
                    self.logoView.hideFilterDock.call(self.logoView)
                });
            });
        },

        showFirstRunPopup: function() {
            this.firstRun = true;
            this.helpPopupEl.appendTo(document.body).show();
        },

        checkFirstTimeLoad: function() {
            var self = this;
            this.firstRun = false;
            this.fileSystem.get("first_run", function(err, data) {
                if (data != "no")
                    self.showFirstRunPopup();
            });
        }
    };

    $(function() {
        var app = window.app = new Application();
    });

    Global.Application = Application;

})();