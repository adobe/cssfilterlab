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
	
	function FilterItemView(filter) {
		this.filter = filter;
		this.filter.on("filterStateChanged", this.onFilterStateChanged.bind(this));
		this.filter.on("filterSourceChanged", this.onFilterSourceChanged.bind(this));
        this.filter.config.on("configChanged", this.onFilterConfigChanged.bind(this));
		this.init();
	}

	FilterItemView.prototype = {
		init: function() {
            var self = this;

            this._buildParamsControls();

            this.el = (this.el || $("<li />"))
                .toggleClass("builtin-filter", this.filter.isBuiltin())
                .toggleClass("custom-filter", !this.filter.isBuiltin())
                .toggleClass("forked-filter", this.filter.isFork())
                .toggleClass('current', this.filter.active)
                .toggleClass('loading', !!this.filter.config.isLoading)
                .data("filterItemView", this);

            if (!this.deleteButton) {
                this.deleteButton = $("<button class='delete-filter' />").text("Delete").appendTo(this.el)
                    .click(function() {
                       self.filter.removeFilter(); 
                    });
            }

            if (!this.dragPoint)
                this.dragPoint = $("<div class='dragpoint' />").appendTo(this.el);
                
            this.stateCheckbox = $("<input type='checkbox'>")
                .click(function(e) {
                    self.filter.toggleFilter();
                });
                
            if (!this.stateToggle)
                this.stateToggle = $("<label class='slide-toggle'>")
                    .append(this.stateCheckbox)
                    .append($("<div>")
                       .append($("<span>"))
                    ) 
                    .appendTo(this.el)
                     
            if (!this.labelEl) {
                this.labelEl = $("<div class='filter-name' />")
                    .appendTo(this.el)
            }
            
            this.labelEl.text(this.filter.config.label);
            
            if (!this.configEl)
                this.configEl = $("<div class='config' />").appendTo(this.el);
            this.configEl.empty().append(this.controlsEl);
        },

        onFilterConfigChanged: function() {
            this.init();
        },

        onFilterStateChanged: function(active) {
        	if (active) {
                this.el.addClass('current');
                this.stateCheckbox.attr("checked", true)
                this.configEl.hide().slideDown(100);
            } else {
                this.el.removeClass('current');
                this.stateCheckbox.attr("checked", false)
                this.configEl.slideUp(100);
            }
        },

		/**
         * Builds shader controls for the given set of parameter values
         * and description
         */
        _buildParamsControls: function () {
            var table = $("<table class='paramsTable' />"),
                self = this,
                controls = [],
                config = this.filter.config;
            this.controls = controls;
            this.controlsEl = table;
            if (config.isLoading)
                return;
            $.each(config.params, function (name) {
                var filterParam = config.config[name],
                    type = filterParam.type || 'range';
                if (type == 'hidden')
                    return;

                var editorClass = Global.Controls.get(type);
                if (!editorClass)
                    return;
                var editor = new editorClass(self, name, filterParam);
                controls.push({
                    name: name,
                    editor: editor
                });
                var tr = $("<tr class='field' />").appendTo(table).append("<td class='field-label'>" + name + ":</td");
                editor.pushControls(tr);
            });
            if (this.filter.source)
                this.onFilterSourceChanged(this.filter.source);
        },

        valuesUpdated: function(paramName) {
            this.filter.valuesUpdated(paramName);
        },

        onFilterSourceChanged: function(source) {
	        $.each(this.controls, function(i, control) {
                control.editor.setSource(source);
            });
        }
	};

	Global.FilterItemView = FilterItemView;

})()