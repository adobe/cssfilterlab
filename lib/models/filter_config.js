(function() {

	function FilterConfig(filterName, jsonConfig) {
		this.init(filterName, jsonConfig);
	}

	FilterConfig.prototype = {
	    init: function(filterName, jsonConfig) {
	    	$.extend(this, jsonConfig);

	    	this.original = jsonConfig;
	        this.name = filterName;
	        this.isBuiltin = FilterConfig.isBuiltinType(jsonConfig);

	        var self = this;
	        $.each(jsonConfig.params, function (name, defaultValue) {
	            var filterParam = Global.Utils.clone(jsonConfig.config[name]),
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
	            self.config[name] = filterParam;
	        });
	    },

	    defaultValues: function() {
            var defaults = {},
                self = this;
            $.each(this.params, function (name, value) {
                var filterParam = self.config[name];
                if (filterParam.type == 'warp' && !value)
                    value = Global.WarpHelpers.generateWarpPoints();
                defaults[name] = value;
            });
            return defaults;
        },

        blendParams: function(A, B, position) {
            var R = {},
                self = this;
            $.each(this.params, function (name, filterParam) {
                var filterParam = self.config[name];
                R[name] = filterParam.mixer(A[name], B[name], position);
            });
            return R;
        },

        generatePreviewCode: function() {
        	return this.generateCode(this.defaultValues());
        },

        generateCode: function(values, colors) {
            if (colors === undefined)
                colors = Global.ColorSchemes.noColoring;
            if (this.isBuiltin)
                return this.generateCodeForBuiltinType(values, colors);
            return this.generateCodeForShader(values, colors);
        },

	    getVertexUrl: function() {
            if (this.edited_vertex)
                return this.edited_vertex;
            if (this.hasVertex)
                return "shaders/vertex/" + this.name + ".vs";
            return null;
        },

        getFragmentUrl: function() {
            if (this.edited_fragment)
                return this.edited_fragment;
            if (this.hasFragment || !this.hasVertex)
                return "shaders/fragment/" + this.name + ".fs"
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
            if (this.mesh)
                mesh.push(this.mesh);
            if (this.meshBox)
                mesh.push(colors.keyword(this.meshBox));
            if (mesh.length)
                shaderParams.push(mesh.join(" "));
            
            $.each(this.params, function (name) {
                var paramConfig = self.config[name],
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
            $.each(this.params, function (name) {
                var paramConfig = self.config[name],
                    value = values[name];
                if (!paramConfig)
                    return;
                filterParams.push(colors.value(paramConfig.generator(value, colors), 
                    paramConfig ? paramConfig.unit : null));
            });
            
            return colors.builtinFn(this.type.fn, filterParams);
        }
	}
	
	FilterConfig.isBuiltinType = function(config) {
	    var type = config.type ? config.type.fn : "custom";
	    return type != "custom";
	}

	Global.FilterConfig = FilterConfig;

})();