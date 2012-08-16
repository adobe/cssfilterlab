(function(){

    function Filter(name, config) {
        Filter.super.call(this);
        this.name = name;
        this.config = config;
        this.active = false;
    }

    Global.Utils.extend(Filter).from(Global.EventDispatcher);

    $.extend(Filter.prototype, {
        filterType: function() {
            return this.config.type ? this.config.type.fn : "custom";
        },

        isBuiltin: function() {
            return this.config.isBuiltin;
        },

        isFork: function() {
            return this.config.isFork;
        },

        toggleFilter: function() {
            this.setActive(!this.active);
        },

        setActive: function(value) {
            if (this.active == value)
                return;
            this.active = value;
            this.fire("filterStateChanged", [this.active]);
        },

        setSource: function(value) {
            this.source = value;
            this.fire("filterSourceChanged", [value]);
        },

        valuesUpdated: function(paramName) {
            this.fire("valuesUpdated", [paramName]);
        },

        removeFilter: function() {
            this.fire("filterRemoved");
        },

        defaultValues: function() {
            var defaults = {},
                self = this;
            $.each(this.config.params, function (name, value) {
                var filterParam = self.config.config[name];
                if (filterParam.type == 'warp' && !value)
                    value = Global.WarpHelpers.generateWarpPoints();
                defaults[name] = value;
            });
            return defaults;
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

        getVertexUrl: function() {
            if (this.config.edited_vertex)
                return this.config.edited_vertex;
            if (this.config.hasVertex)
                return "shaders/vertex/" + this.config.name + ".vs";
            return null;
        },

        getFragmentUrl: function() {
            if (this.config.edited_fragment)
                return this.config.edited_fragment;
            if (this.config.hasFragment || !this.config.hasVertex)
                return "shaders/fragment/" + this.config.name + ".fs"
            return null;
        },

        /**
         * Helper routine to change the custom shader parameters.
         */
        generateCodeForShader: function(values, colors) {
            var shaderParams = [],
                shaders = [],
                self = this,
                vertexUrl = this.getVertexUrl(),
                fragmentUrl = this.getFragmentUrl();
            shaders.push(vertexUrl ? colors.fn("url", [colors.uri(vertexUrl)]) : colors.keyword("none"));
            if (fragmentUrl)
                shaders.push(colors.fn("url", [colors.uri(fragmentUrl)]));
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
        }

    });

    Global.Filter = Filter;

})()