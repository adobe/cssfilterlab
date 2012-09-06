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

(function(){
	function FilterStoreView(filterStore, filterList, filterListView, shaderEditor, type) {
	    FilterStoreView.super.call(this);
		
        this.type = this.filterTypes[type];
		this.filterStore = filterStore;
        this.filterStore.on("filterAdded", this.onFilterAdded.bind(this));
        this.filterStore.on("filterDeleted", this.onFilterDeleted.bind(this));
        
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
	  
	Global.Utils.extend(FilterStoreView).from(Global.EventDispatcher);
    
	$.extend(FilterStoreView.prototype, {

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
                
            function addFilter(e){
                e.preventDefault()
                self.filterListView.dockPanel.setActive(true);
                var filter = self.filterList.addFilter(filterConfig);
                filter.setActive(true);
                self.fire("filterSelected", [filter]);
            }

            var self = this;
            var el = $("<div />")
                    .addClass("filter-item")
                    .addClass(filterConfig.isBuiltin ? "builtin-filter" : "custom-filter")
                    .data("filterConfig", filterConfig)
                    .attr("data-filterName", encodeURIComponent(filterConfig.name));
            
            if (filterConfig.isFork)
                el.addClass("forked-filter");

            var cssPreview = filterConfig.generatePreviewCode(),
                previewEl = $("<div />")
                            .addClass("filter-preview")
                            .css("-webkit-filter", cssPreview)
                            .click(addFilter)
                            .appendTo(el);

            var titleEl = $("<div />")
                            .addClass("filter-label")
                            .text(filterConfig.label)
                            .click(addFilter)
                            .appendTo(el);
                             
            var buttonBox = $("<div class='button-box'>");
            el.append(buttonBox)

            buttonBox.append($("<a href='' />")
                .addClass("button cta dark")
                .text("Add")
                .click(addFilter));
                
            if (!filterConfig.isBuiltin) { 
                if (!filterConfig.isFork) {
                    buttonBox.append($("<a href='#' />")
                        .addClass("customize-link icon icon-fork")
                        .text("Fork")
                        .attr("title", "Fork filter")
                        .click(function(e) {
                            e.stopPropagation();
                            self.forkFilter(filterConfig);
                        }));
                } else {
                    buttonBox.append($("<a href='#' />")
                        .addClass("customize-link button")
                        .text("Customize")
                        .click(function(e) {
                            e.stopPropagation();
                            self.customizeFilter(el, filterConfig);
                        }));
                    buttonBox.append($("<a href='#'/>")
                        .addClass("icon icon-remove")
                        .text("Delete")
                        .click(function(e) {
                            e.stopPropagation();
                            self.deleteFilter(filterConfig);
                        }));
                }
            }

            filterConfig.on("configChanged", this.onFilterConfigChanged.bind(this, filterConfig, titleEl));

            this.insertFilterElement(el, filterConfig);

            if (filterConfig.isFork && !loadedFromPreset) {
                this.dockPanel.setActive(true);
                el[0].scrollIntoView();
                el.hide().effect("highlight", {}, 400);
                this.customizeFilter(el, filterConfig);
            }
        },
        
        onFilterDeleted: function(filterConfig){  
            this.filters.forEach(function(filter, index){
                if (filter.data("filterConfig").name === filterConfig.name){
                    filter.remove()
                    this.filters.splice(index, 1)
                }
            }.bind(this))
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
        
        deleteFilter: function(filterConfig){
            this.filterStore.deleteFilter(filterConfig)
        },

        customizeFilter: function(el, filterConfig) {
            $.each(this.filters, function(i, el) { el.removeClass("current"); });
            el.addClass("current");
            this.shaderEditor.loadFilter(filterConfig);
        },

        onFilterConfigChanged: function(filterConfig, titleEl) {
            titleEl.text(filterConfig.label);
        },

        insertUnsupportedPopup: function(el) {
            this.unsupportedPopupEl = el.clone(true);
            this.filterStockListEl.before(this.unsupportedPopupEl);
        }
	});

	Global.FilterStoreView = FilterStoreView;
})();