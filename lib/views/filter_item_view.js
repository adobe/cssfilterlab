(function(){
	
	function FilterItemView(filter) {
		this.filter = filter;
		this.filter.on("filterStateChanged", this.onFilterStateChanged.bind(this));
		this.filter.on("filterSourceChanged", this.onFilterSourceChanged.bind(this));
		this.init();
	}

	FilterItemView.prototype = {
		init: function() {
            var self = this;

            this._buildParamsControls();

            this.el = $("<li />")
                .addClass(this.filter.isBuiltin() ? "builtin-filter" : "custom-filter")
                .data("filterItemView", this);

            if (this.active)
                this.el.addClass('current');

            this.deleteButton = $("<button class='delete-filter' />").text("X").appendTo(this.el)
                .click(function() {
                   self.filter.removeFilter(); 
                });
            this.dragPoint = $("<div class='dragpoint' />").appendTo(this.el);

            this.labelEl = $("<div class='filter-name' />")
                .text(this.filter.config.name)
                .appendTo(this.el)
                .click(function() {
                    self.filter.toggleFilter();
                });

            this.configEl = $("<div class='config' />").append(this.controlsEl).appendTo(this.el);
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
                var tr = $("<tr />").appendTo(table).append("<td>" + name + "</td");
                editor.pushControls(tr);
            });
            this.controls = controls;
            this.controlsEl = table;
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