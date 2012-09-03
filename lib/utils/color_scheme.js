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

    Global.ColorSchemes = {
        noColoring: noColoring,
        colorTheme: colorTheme
    };

})();