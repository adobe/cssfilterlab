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

	function FilterConfig(filterName, jsonConfig) {
        FilterConfig.super.call(this);
        if (jsonConfig.loading) {
            this.isLoading = true;
            this.isBuiltin = false;
            this.isFork = true;
            this.name = filterName;
            return;
        }
		this.init(filterName, jsonConfig);
	}

    Global.Utils.extend(FilterConfig).from(Global.EventDispatcher);

	$.extend(FilterConfig.prototype, {
	    init: function(filterName, jsonConfig) {
            this.name = filterName;
	    	this.original = jsonConfig;
            this.mix = jsonConfig.mix;
            this.mesh = jsonConfig.mesh;
            this.meshBox = jsonConfig.meshBox;
            this.hasVertex = jsonConfig.hasVertex;
            this.hasFragment = jsonConfig.hasFragment;
            this.type = jsonConfig.type;
            this.label = jsonConfig.label || filterName;
	    	this.isBuiltin = FilterConfig.isBuiltinType(jsonConfig);
            this.params = {}
            this.config = {};

	        var self = this;
	        $.each(jsonConfig.params, function (name, defaultValue) {
                var filterConfig = jsonConfig.config[name];
                if (!filterConfig)
                    return;
	            var filterParam = Global.Utils.clone(filterConfig),
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
                self.params[name] = defaultValue;
	        });
	    },

        reload: function(config) {
            var wasLoading = this.isLoading,
                oldDefaults = this.defaultValues();
            this.isLoading = false;
            this.init(this.name, config);
            var diff = this.compareDefaultValues(oldDefaults, this.defaultValues());
            console.log(diff);
            this.fire("configChanged", [diff, wasLoading]);
        },

        compareDefaultValues: function(oldVals, newVals) {
            var deletedKeys = [], addedValues = {};
            $.each(oldVals, function(name, value) {
                if (newVals.hasOwnProperty(name))
                    return;
                deletedKeys.push(name);
            });
            $.each(newVals, function(name, value) {
                if (oldVals.hasOwnProperty(name))
                    return;
                addedValues[name] = value;
            });
            return {
                deletedKeys: deletedKeys,
                addedValues: addedValues
            };
        },

	    defaultValues: function() {
            var defaults = {},
                self = this;
            if (this.isLoading)
                return defaults;
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
            if (this.isLoading)
                return R;
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
            if (this.isLoading)
                return "";
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
            if (fragmentUrl) {
                var fragmentShader = colors.fn("url", [colors.uri(fragmentUrl)]);
                if (this.mix)
                    shaders.push(colors.fn("mix", [fragmentShader + " " + colors.keyword(this.mix.blendMode) + " " + colors.keyword(this.mix.compositeOperator)]));
                else
                    shaders.push(fragmentShader);
            }
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
                    value = values[name];
                if (!value)
                    return;
                var cssValue = colors.value(paramConfig.generator(value, colors), paramConfig ? paramConfig.unit : null);
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
        },

        getData: function() {
            if (!this.data)
                this.data = {};
            return this.data;
        }
	});
	
	FilterConfig.isBuiltinType = function(config) {
	    var type = config.type ? config.type.fn : "custom";
	    return type != "custom";
	}

	Global.FilterConfig = FilterConfig;

})();