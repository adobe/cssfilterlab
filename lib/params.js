/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

(function () {
    
    function makeEditor(label, startCallback, changeCallback) {
        var editor = $("<input type='test' class='value-editor' />");
        function done() {
            editor.hide();
            label.show();
        }
        editor.hide().change(function() {
            return changeCallback(editor);
        }).focusout(function(){
            done();
        }).keyup(function (e){
            if (e.which == 13) {
                done();
                e.preventDefault();
            }
            if (!changeCallback(editor)) {
                // Rewrite last known good value.
                startCallback(editor);
                editor.select();
            }
        });
        label.click(function() { 
            if (!startCallback(editor))
                return;
            label.hide();
            editor.show().select();
        });
        
        return $("<div />").append(label).append(editor);
    }
    /**
     * Factory for param controls.
     */
    var ParamsControlsFactory = {
        range : function (name, desc, update, sourceChangedNotifiers) {
            var min = desc.min ? desc.min : 0,
                max = desc.max ? desc.max : 1,
                step = desc.step ? desc.step : 0.1,
                label = $("<span class='value-label'/>"),
                params = null;
            
            var ctrl = $("<input type='range' " +
                       "id='range-" + name + "'" + 
                       "min='" + min + "'" +
                       "max='" + max + "'" + 
                       "value=''" + 
                       "step='" + step + "' />");
                       
             ctrl.change(function () {
                 if (!params) return;
                 params[name] = parseFloat(this.value);
                 label.html(Math.round(100 * this.value) / 100);
                 update();
             });
             
             function valueChanged() {
                  var value = params[name];
                  ctrl.val(value);
                  label.html(Math.round(100 * value) / 100);
             }
             
             function sourceChanged(newSource) {
                 params = newSource;
                 if (!params)
                    return;
                 valueChanged();
             }
             sourceChangedNotifiers.push(sourceChanged);
             
             function showEditor(editor) {
                if (!params)
                    return false;
                var value = params[name];
                editor.val(Math.round(100 * value) / 100);
                return true;
             }
             function editorChangedCallback(editor) {
                if (!params)
                     return false;
                 var value = editor.val();
                 value = value == '-' ? 0 : parseFloat(value);
                if (isNaN(value) || value < min || value > max)
                    return false;
                params[name] = value;
                valueChanged();
                update();
                return true;
             }
             return [ctrl, makeEditor(label, showEditor, editorChangedCallback)];
        },
        controlPoints : function (name, desc, update, sourceChangedNotifiers) {
			var ctrl = $("<div id='param-" + name + "'></div>");
         
            var canvas = buildWarpCanvas(ctrl, 180, 180, update);
             
            function sourceChanged(newSource) {
                if (!newSource)
                    canvas.setPoints(null);
                else
                    canvas.setPoints(newSource[name]);
                canvas.redraw();
            }
            
            sourceChangedNotifiers.push(sourceChanged);
            
            return [ctrl];
		},
		
        transform : function (name, desc, update, sourceChangedNotifiers) {
            var min = desc.min ? desc.min : -180,
                max = desc.max ? desc.max : 180,
                step = desc.step ? desc.step : 1,
                params = null;

            var controls = ['rotationX', 'rotationY', 'rotationZ'];
            var elements = $("<table class='param-transform' />");

            $.each(controls, function(key, transformName) {
                var label = $("<span class='value-label' />");
                var ctrl = $("<input type='range' " +
                            "id='range-" + name + "-" + transformName + "'" + 
                            "min='" + min + "'" +
                            "max='" + max + "'" + 
                            "value='0'" + 
                            "step='" + step + "' />");

                var row = $("<tr />").appendTo(elements);
                $("<td>" + transformName + "</td>").appendTo(row);
                $("<td />").append(ctrl).appendTo(row);
                $("<td />").append(makeEditor(label, showEditor, editorChangedCallback)).appendTo(row);

                ctrl.change(function () {
                    if (!params) return;
                    params[name][transformName] = parseFloat(this.value);
                    label.html(Math.round(100 * this.value) / 100);
                    update();
                });
                
                function valueChanged() {
                    var value = params[name][transformName];
                    ctrl.val(value);
                    label.html(Math.round(100 * value) / 100);
                }
                
                function sourceChanged(newSource) {
                    params = newSource;
                    if (!params) return;
                    valueChanged();
                }
                
                function showEditor(editor) {
                    if (!params)
                        return false;
                    var value = params[name][transformName];
                    editor.val(Math.round(100 * value) / 100);
                    return true;
                }
                function editorChangedCallback(editor) {
                    if (!params)
                         return false;
                    var value = editor.val();
                    value = value == '-' ? 0 : parseFloat(value);
                    if (isNaN(value) || value < min || value > max)
                        return false;
                    params[name][transformName] = value;
                    valueChanged();
                    update();
                    return true;
                }
                 
                sourceChangedNotifiers.push(sourceChanged);
            });
            
            return [elements];
        },
        
        color : function (name, desc, update, sourceChangedNotifiers) {
            var min = desc.min ? desc.min : 0,
                max = desc.max ? desc.max : 1,
                step = desc.step ? desc.step : 0.001,
                params = null;

            var controls = ['r', 'g', 'b', 'a'];
            var elements = $("<table class='param-color' />");
            
            var colorPreview = $("<div class='param-color-preview'></div>");

            function updateColorPreview() {
                if (!params)
                    return;
                var v = params[name];
                var colors = [Math.floor(v[0] * 255),
                              Math.floor(v[1] * 255),
                              Math.floor(v[2] * 255),
                              v[3]];
                colorPreview.css("background-color", "rgba(" + colors.join(", ") + ")");
            }

            $.each(controls, function(key, colorName) {
                var label = $("<span class='value-label' />");
                var ctrl = $("<input type='range' " +
                            "id='range-" + name + "-" + colorName + "'" + 
                            "min='" + min + "'" +
                            "max='" + max + "'" + 
                            "value='0'" + 
                            "step='" + step + "' />");

                var row = $("<tr />").appendTo(elements);
                if (key == 0)
                    $("<td class='color-preview' rowspan='4'></td>").append(colorPreview).appendTo(row);
                
                $("<td class='color-name'>" + colorName + "</td>").appendTo(row);
                $("<td class='color-range' />").append(ctrl).appendTo(row);
                $("<td class='color-label' />").append(makeEditor(label, showEditor, editorChangedCallback)).appendTo(row);
                
                ctrl.change(function () {
                    if (!params) return;
                    var value = parseFloat(this.value);
                    params[name][key] = value;
                    label.html(Math.round(100 * value) / 100);
                    updateColorPreview();
                    update();
                });

                function valueChanged() {
                    var value = params[name][key];
                    ctrl.val(value);
                    label.html(Math.round(100 * value) / 100);
                }
                
                function sourceChanged(newSource) {
                    params = newSource;
                    if (!params) return;
                    valueChanged();
                }
                sourceChangedNotifiers.push(sourceChanged);
                
                function showEditor(editor) {
                    if (!params)
                        return false;
                    var value = params[name][key];
                    editor.val(Math.round(100 * value) / 100);
                    return true;
                }
                function editorChangedCallback(editor) {
                    if (!params)
                         return false;
                    var value = editor.val();
                    value = value == '-' ? 0 : parseFloat(value);
                    if (isNaN(value) || value < min || value > max)
                        return false;
                    params[name][key] = value;
                    valueChanged();
                    update();
                    return true;
                }
            });
            
            function sourceChanged(newSource) {
                params = newSource;
                updateColorPreview();
            }
            sourceChangedNotifiers.push(sourceChanged);
            
            return [elements];
        },

        unknown : function (name, desc, update, sourceChangedNotifiers) {
            var ctrl = $("<input type='text' " +
                       "id='param-" + name + "'" + 
                       "value='' />");
                       
             ctrl.change(function () {
                 if (!params) return;
                 params[name] = this.value;
                 update();
             });
             
             function sourceChanged(newSource) {
                 params = newSource;
                 if (!params) return;
                 ctrl.val(params[name]);
             }
             sourceChangedNotifiers.push(sourceChanged);
             
             return [ctrl];
		}
    };
    
    /**
     * Default param description
     */
    var DEFAULT_PARAM_DESC = {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.1
    };

        
    /**
     * Builds shader controls for the given set of parameter values
     * and description
     *
     * @param params an object with the shader parameter values
     * @param paramsDesc an object with an object for each of the parameters. 
     *        If no paramsDesc is found for a property, then the param is
     *        assumed to be a 'range', with a min value of 0 and a max value
     *        of 1.
     * @param updateCallback a function to be called when a value is updated.
     */
    function buildParamsControls (params, paramsDesc, updateCallback) {
        var table = $("<table class='paramsTable' />");
         
        var sourceChangedNotifiers = [];
         
        $.each(params, function (name) {
            var type = 'range', 
                desc = DEFAULT_PARAM_DESC,
                ctrl, factory;
             
            if (paramsDesc && paramsDesc[name]) {
                desc = paramsDesc[name];
            }
             
            if (desc.type) { type = desc.type; }
            if (type == 'hidden')
                return;
             
            var tr = $("<tr />").appendTo(table).append("<td>" + name + "</td");

		    factory = ParamsControlsFactory[type] ? ParamsControlsFactory[type] : 
											     ParamsControlsFactory.unknown;
			
            $.each(factory(name, paramsDesc[name], updateCallback, sourceChangedNotifiers),
                   function (i, v) {
                       var td = $("<td />");
                       td.append(v);
                       tr.append(td);
                   });
        });
         
        function setSource(newSource) {
            for (var i = 0; i < sourceChangedNotifiers.length; ++i)
                sourceChangedNotifiers[i](newSource);
        }

        return {
            el: table,
            setSource: setSource
        }
    }
     
    function generateTransform(v, colors) {
        return [colors.fn("rotateX", [colors.value(v.rotationX || 0, "deg")]),
        colors.fn("rotateY", [colors.value(v.rotationY || 0, "deg")]),
        colors.fn("rotateZ", [colors.value(v.rotationZ || 0, "deg")])].join(" ");
    }
     
    function generateFilterArray(values, colors) {
       return colors.fn("array", values);
    }
        
    function generateVector(values, colors) {
        return $.map(values, function(val) { return colors.value(val); }).join(" ");
    }

    function generateColor(values, colors) {
        return colors.fn("rgba", $.map(values, function(val, index) { 
            if (index < 3)
                return colors.value(Math.round(val * 255));
            return colors.value(val); 
        }));
    }

    function identity(a) { return a; }
     
    function roundedValue(value) {
        if (typeof value == "number")
           return Math.round(value * 1000) / 1000;
       return value;
    }
     
    var noColoring = {
        parameterName: identity,
        value: function(value, unit) {
            return roundedValue(value) + ((unit !== undefined) ? unit : "");
        },
        fn: function(fn, args) {
            var valueArgs = [];
            $.each(args, function(key, value) { valueArgs.push(noColoring.value(value)); });
            return fn + "(" + valueArgs.join(", ") + ")";
        },
        builtinFn: function(fn, args) {
            var valueArgs = [];
            $.each(args, function(key, value) { valueArgs.push(noColoring.value(value)); });
            return fn + "(" + valueArgs.join(" ") + ")";
        },
        uri: identity,
        keyword: identity,
        keyframe: function(percent, filters) {
            return percent + " {\n" +
                   "    -webkit-filter: " + filters.join(" ") + ";\n" +
                   "}";
        }
    };
     
    var colorTheme = {
        parameterName: function(name) {
            return "<span class='parameter-name'>" + name + "</span>";
        },
        value: function(value, unit) {
            return "<span class='parameter-value'>" + roundedValue(value) + "</span>" +
                    ((unit !== undefined) ? ("<span class='parameter-unit'>" + unit + "</span>") : "");
        },
        fn: function(fn, args) {
            var valueArgs = [];
            $.each(args, function(key, value) { valueArgs.push(colorTheme.value(value)); });
            return "<span class='function-name " + fn + "'>" + fn +
                 "</span><span class='function-parenthesis left " + fn + "'>(</span><span class='function-arguments " + fn + "'>" +
                 valueArgs.join(", ") + "</span><span class='function-parenthesis right " + fn + "'>)</span>";
        },
        builtinFn: function(fn, args) {
            var valueArgs = [];
            $.each(args, function(key, value) { valueArgs.push(colorTheme.value(value)); });
            return "<span class='function-name " + fn + "'>" + fn +
                 "</span><span class='function-parenthesis left " + fn + "'>(</span><span class='function-arguments " + fn + "'>" +
                 valueArgs.join(" ") + "</span><span class='function-parenthesis right " + fn + "'>)</span>";
        },
        uri: function(uri) {
            return "<a class='uri' href='" + uri + "' target='_blank'>" + uri + "</a>";
        },
        keyword: function(value) {
            return "<span class='keyword'>" + value + "</span>";
        },
        keyframe: function(percent, filters) {
            return "<div class='keyframe'>"+
                   "<span class='keyframe-percent'>" + percent + "</span> " +
                   "<span class='curly-brace left'>{</span>" + 
                   "<div class='keyframe-content'>" + 
                   "<span class='property-name'>-webkit-filter</span>: <span class='property-value'>" +
                   filters.join(" ") +
                   "</span>;</div><span class='curly-brace right'>}</span></div>";
        }
    };
     
    /**
     * Helper routine to change the shader parameters.
     * 
     * @param shader the shader config for a specific filter
     */
    function customFilterForShader (shader, values, colors) {
        if (colors === undefined) {
            colors = noColoring;
        }
        
        var shaderParams = [];

        var shaders = [];
        shaders.push(shader.hasVertex ? colors.fn("url", [colors.uri("shaders/vertex/" + shader.name + ".vs")]) : colors.keyword("none"));
        
        if (shader.hasFragment || !shader.hasVertex) {
            shaders.push(colors.fn("url", [colors.uri("shaders/fragment/" + shader.name + ".fs")]));
        }
        
        shaderParams.push(shaders.join(" "));

        var mesh = [];
        if (shader.mesh) {
            mesh.push(shader.mesh);
        }
        
        if (shader.meshBox) {
            mesh.push(colors.keyword(shader.meshBox));
        }
        
        if (mesh.length) {
            shaderParams.push(mesh.join(" "));
        }
        
        $.each(shader.params, function (name, defaultValue) {
            var paramConfig = shader.config[name];
            var value = values[name];
            if (paramConfig && paramConfig.generator) {
                shaderParams.push(colors.parameterName(name) + " " + paramConfig.generator(value, colors));
            } else {
                shaderParams.push(colors.parameterName(name) + " " + colors.value(value, paramConfig ? paramConfig.unit : null));
            }
        });
        
        return colors.fn("custom", shaderParams);
    }

    /**
     * Helper routine to change the builtin filter parameters.
     * 
     * @param filter the config for a specific filter
     */
    function customFilterForBuiltinType (filter, values, colors) {
        if (colors === undefined)
            colors = noColoring;

        var filterParams = [];
        $.each(filter.type.params, function (index, name) {
            var paramConfig = filter.config[name];
            var value = values[name];
            if (paramConfig && paramConfig.generator)
                filterParams.push(paramConfig.generator(value, colors));
            else
                filterParams.push(colors.value(value, paramConfig ? paramConfig.unit : null));
        });
        
        return colors.builtinFn(filter.type.fn, filterParams);
    }
    
    function mixNumber(a, b, t) {
        return a * (1 - t) + b * t;
    }
    
    function mixVector(a, b, t) {
        var r = [];
        for (var i=0; i<a.length; ++i)
            r.push(mixNumber(a[i], b[i], t));
        return r;
    }
    
    function mixVectorOfVectors(a, b, t) {
        var r = [];
        for (var i=0; i < a.length; ++i) {
            var row = []; r.push(row);
            var l2 = a[i].length;
            for (var j=0; j < l2; ++j)
                row.push(mixVector(a[i][j], b[i][j], t));
        }
        return r;
    }
    
    function mixHash(fn) {
        return function(a, b, t) {
            var r = {};
            $.each(a, function(key, valueA) {
                r[key] = fn(valueA, b[key], t);
            });
            return r;
        }
    }
    
    function dontMix(a, b, t) {
        return a;
    }
    
    function blendParams(shader, A, B, t) {
        var R = {};
        $.each(shader.params, function (name, defaultValue) {
            var paramConfig = shader.config[name];
            var valueA = A[name];
            var valueB = B[name];
            var type = 'range';
            if (paramConfig.type) { type = paramConfig.type; }
            
            var result;
            
            // FIXME: remove color here when mergin is implemented for colors.
            if (type == 'hidden' || type == 'unknown')
                result = valueA;
            else if (paramConfig && paramConfig.mixer)
                result = paramConfig.mixer(valueA, valueB, t);
            else
                result = mixNumber(valueA, valueB, t);
            
            R[name] = result;
        });
        return R;
    }

	window.customFilterForShader = customFilterForShader;
    window.customFilterForBuiltinType = customFilterForBuiltinType;
	window.blendParams = blendParams;
	window.buildParamsControls = buildParamsControls;
	window.generateTransform = generateTransform;
	window.generateFilterArray = generateFilterArray;
	window.generateVector = generateVector;
    window.generateColor = generateColor;
	window.mixNumber = mixNumber;
	window.mixVector = mixVector;
	window.mixVectorOfVectors = mixVectorOfVectors;
	window.dontMix = dontMix;
	window.mixHash = mixHash;
	window.colorTheme = colorTheme;
})();