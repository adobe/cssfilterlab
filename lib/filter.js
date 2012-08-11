(function(){

    function Filter(filterList, name, config) {
        this.name = name;
        this.filterList = filterList;
        this.config = config;
        this.active = false;
        this.fixConfig();
    }

    Filter.prototype = {
        fixConfig: function() {
            var self = this;
            $.each(this.config.params, function (name) {
                var filterParam = self.config.config[name],
                    type = filterParam.type || 'range',
                    mixer = (type == 'hidden' || type == 'unknown') ?
                            Global.mixers.dontMix :
                            Global.mixers.mixNumber,
                    generator = filterParam.generator || "identity";
                if (filterParam.mixer) {
                    if (filterParam.mixer.fn)
                        mixer = Global.mixers[filterParam.mixer.fn].apply(self, filterParam.mixer.params);
                    else
                        mixer = Global.mixers[filterParam.mixer];
                }
                filterParam.mixer = mixer;
                filterParam.generator = Global.CSSGenerators[generator] || Global.CSSGenerators.identity;
            });
        },

        filterType: function() {
            return this.config.type ? this.config.type.fn : "custom";
        },

        isBuiltin: function() {
            return this.config.isBuiltin;
        },

        toggleFilter: function() {
            this.setActive(!this.active);
        },

        setActive: function(value) {
            if (this.active == value)
                return;
            this.active = value;
            this.filterList.onFilterStateChange(this);
            if (this.active) {
                this.el.addClass('current');
                this.configEl.hide().slideDown(100);
            } else {
                this.el.removeClass('current');
                this.configEl.slideUp(100);
            }
        },

        generateFilterItem: function() {
            var self = this;

            this._buildParamsControls();

            this.el = $("<li />")
                .addClass(this.isBuiltin() ? "builtin-filter" : "custom-filter");

            this.deleteButton = $("<button class='delete-filter' />").text("X").appendTo(this.el)
                .click(function() {
                   self.filterList.removeFilter(self); 
                });
            this.dragPoint = $("<div class='dragpoint' />").appendTo(this.el);

            this.labelEl = $("<div class='filter-name' />")
                .text(this.config.name)
                .appendTo(this.el)
                .click(function() {
                    self.toggleFilter();
                });

            this.configEl = $("<div class='config' />").append(this.controlsEl).appendTo(this.el);

            return this.el;
        },

        defaultValues: function() {
            return this.config.params;
        },

        blendParams: function(A, B, position) {
            var R = {},
                self = this;
            $.each(this.config.params, function (name, filterParam) {
                var filterParam = self.config.config[name];
                R[name] = filterParam.mixer(A[name], B[name], position);
            });
            return R;
        },

        generateCode: function(values, colors) {
            if (colors === undefined)
                colors = Global.ColorSchemes.noColoring;
            if (this.isBuiltin())
                return this.generateCodeForBuiltinType(values, colors);
            return this.generateCodeForShader(values, colors);
        },

        /**
         * Helper routine to change the custom shader parameters.
         */
        generateCodeForShader: function(values, colors) {
            var shaderParams = [],
                shaders = [],
                self = this;
            shaders.push(this.config.hasVertex ? colors.fn("url", [colors.uri("shaders/vertex/" + this.config.name + ".vs")]) : colors.keyword("none"));
            if (this.config.hasFragment || !this.config.hasVertex)
                shaders.push(colors.fn("url", [colors.uri("shaders/fragment/" + this.config.name + ".fs")]));
            shaderParams.push(shaders.join(" "));

            var mesh = [];
            if (this.config.mesh)
                mesh.push(this.config.mesh);
            if (this.config.meshBox)
                mesh.push(colors.keyword(this.config.meshBox));
            if (mesh.length)
                shaderParams.push(mesh.join(" "));
            
            $.each(this.config.params, function (name) {
                var paramConfig = self.config.config[name],
                    value = values[name],
                    cssValue = colors.value(paramConfig.generator(value, colors), paramConfig ? paramConfig.unit : null);
                shaderParams.push(colors.parameterName(name) + " " + cssValue);
            });

            return colors.fn("custom", shaderParams);
        },

        /**
         * Helper routine to change the builtin filter parameters.
         */
        generateCodeForBuiltinType: function(values, colors) {
            var filterParams = [],
                self = this;
            $.each(this.config.params, function (name) {
                var paramConfig = self.config.config[name],
                    value = values[name];
                if (!paramConfig)
                    return;
                filterParams.push(colors.value(paramConfig.generator(value, colors), 
                    paramConfig ? paramConfig.unit : null));
            });
            
            return colors.builtinFn(this.config.type.fn, filterParams);
        },        

        /**
         * Builds shader controls for the given set of parameter values
         * and description
         */
        _buildParamsControls: function () {
            var table = $("<table class='paramsTable' />"),
                self = this,
                controls = [];
            $.each(this.config.params, function (name) {
                var filterParam = self.config.config[name],
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
        },

        valuesUpdated: function(paramName) {
            this.filterList.valuesUpdated(this, paramName);
        },

        setSource: function(value) {
            $.each(this.controls, function(i, control) {
                control.editor.setSource(value);
            });
        }

    };

    Global.Filter = Filter;

})()