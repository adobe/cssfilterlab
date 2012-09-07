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

    function roundedValue(value) {
        if (typeof value == "number")
           return Math.round(value * 1000) / 1000;
       return value;
    }

    var noColoring = {
        parameterName: Global.Utils.identity,
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
        uri: Global.Utils.identity,
        keyword: Global.Utils.identity,
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
        _dataURL: /^data:/,
        uri: function(uri) {
            var className = "";
            if (this._dataURL.test(uri))
                className = " data-uri";
            return "<a class='uri" + className + "' href='" + uri + "' target='_blank'>" + uri + "</a>";
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

    Global.ColorSchemes = {
        noColoring: noColoring,
        colorTheme: colorTheme
    };

})();