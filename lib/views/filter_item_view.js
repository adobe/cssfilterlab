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
                this.deleteButton = $("<button class='delete-filter' />").text("X").appendTo(this.el)
                    .click(function() {
                       self.filter.removeFilter(); 
                    });
            }

            if (!this.dragPoint)
                this.dragPoint = $("<div class='dragpoint' />").appendTo(this.el);

            if (!this.labelEl) {
                this.labelEl = $("<div class='filter-name' />")
                    .appendTo(this.el)
                    .click(function() {
                        self.filter.toggleFilter();
                    });
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
                this.configEl.hide().slideDown(100);
            } else {
                this.el.removeClass('current');
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