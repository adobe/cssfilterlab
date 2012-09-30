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
                self.params[name] = self.fixDefaultValue(type, defaultValue);
            });
        },

        defaultValuesByType: {
            transform: {
                perspective: 1000,
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            }
        },

        fixDefaultValue: function(type, value) {
            var defaultValue = this.defaultValuesByType[type];
            if (!defaultValue || typeof(defaultValue) != "object")
                return value;
            $.each(defaultValue, function(key, val) {
                if (value.hasOwnProperty(key))
                    return;
                value[key] = val;
            });
            return value;
        },

        reload: function(config) {
            var wasLoading = this.isLoading,
                oldConfig = this.config,
                oldDefaults = this.defaultValues();
            this.isLoading = false;
            this.init(this.name, config);
            var newDefaults = this.defaultValues();
            var diff = this.compareDefaultValues(oldDefaults, newDefaults);
            if (oldConfig)
                this.addChangedTypesValues(oldConfig, diff, newDefaults);
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
                addedValues: addedValues,
                changedValues: {}
            };
        },

        addChangedTypesValues: function(oldConfig, diff, newDefaults) {
            var self = this;
            $.each(oldConfig, function(key, oldParamConfig) {
                var newParamConfig = self.config[key];
                if (!newParamConfig || newParamConfig.type == oldParamConfig.type)
                    return;
                diff.changedValues[key] = newDefaults[key];
            });
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
                mesh.push(this.mesh.columns + " " + this.mesh.rows);
            if (this.meshBox)
                mesh.push(colors.keyword(this.meshBox));
            if (mesh.length)
                shaderParams.push(mesh.join(" "));

            $.each(this.params, function (name) {
                var paramConfig = self.config[name],
                    value = values[name];
                if (value === undefined || value === null)
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
