/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
                name: "Built-in",
                check: function(filterConfig) {
                    return filterConfig.isBuiltin;
                }
            },
            "custom": {
                name: "Custom",
                check: function(filterConfig) {
                    return !filterConfig.isBuiltin && !filterConfig.isFork;
                }
            },
            "forked": {
                name: "Forked Custom",
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
                    .attr("data-filterName", encodeURIComponent(filterConfig.name))
                    .click(addFilter);

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
            el.append(buttonBox)

            if (!filterConfig.isBuiltin) {
                if (!filterConfig.isFork) {
                    buttonBox.append($("<a href='#' />")
                        .addClass("customize-link icon icon-fork")
                        .text("Fork")
                        .attr("title", "Fork filter")
                        .click(function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            self.forkFilter(filterConfig);
                        }));
                } else {
                    buttonBox.append($("<a href='#' />")
                        .addClass("customize-link icon icon-edit")
                        .text("Edit")
                        .attr("title", "Edit filter")
                        .click(function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            self.customizeFilter(el, filterConfig);
                        }));
                    buttonBox.append($("<a href='#'/>")
                        .addClass("icon icon-remove")
                        .text("Delete")
                        .attr("title", "Delete filter")
                        .click(function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var message = "Are you sure you want to delete the '"+ filterConfig.label +"' filter?";

                            if(window.confirm(message))
                                self.deleteFilter(filterConfig);
                        }));
                }
            }

            filterConfig.on("configChanged", this.onFilterConfigChanged.bind(this, filterConfig, titleEl, previewEl));

            this.insertFilterElement(el, filterConfig);

            if (filterConfig.isFork && !loadedFromPreset) {
                this.dockPanel.setActive(true);
                el[0].scrollIntoView();
                el.hide().effect("highlight", {}, 400);
                this.customizeFilter(el, filterConfig);
                var filter = self.filterList.addFilter(filterConfig);
                filter.setActive(true);
            }
        },

        onFilterDeleted: function(filterConfig){
            this.filters.forEach(function(filter, index){
                if (filter.data("filterConfig").name === filterConfig.name){
                    filter.remove()
                    this.filters.splice(index, 1)
                }
            }.bind(this))

            if (this.shaderEditor.filter && this.shaderEditor.filter.name === filterConfig.name){
                this.shaderEditor.hide()
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

        deleteFilter: function(filterConfig){
            this.filterStore.deleteFilter(filterConfig)
        },

        customizeFilter: function(el, filterConfig) {
            $.each(this.filters, function(i, el) { el.removeClass("current"); });
            el.addClass("current");
            this.shaderEditor.loadFilter(filterConfig);
        },

        onFilterConfigChanged: function(filterConfig, titleEl, previewEl) {
            titleEl.text(filterConfig.label);
            previewEl.css("-webkit-filter", filterConfig.generatePreviewCode());
        },

        insertUnsupportedPopup: function(el) {
            this.unsupportedPopupEl = el.clone(true);
            this.filterStockListEl.before(this.unsupportedPopupEl);
        }
    });

    Global.FilterStoreView = FilterStoreView;
})();
