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

    Global.CSSGenerators = {};

    Global.CSSGenerators.identity = Global.Utils.identity;

    Global.CSSGenerators.transform = function(v, colors) {
        return [colors.fn("rotateX", [colors.value(v.rotationX || 0, "deg")]),
        colors.fn("rotateY", [colors.value(v.rotationY || 0, "deg")]),
        colors.fn("rotateZ", [colors.value(v.rotationZ || 0, "deg")])].join(" ");
    }
     
    Global.CSSGenerators.filterArray = function(values, colors) {
       return colors.fn("array", values);
    }
        
    Global.CSSGenerators.vector = function(values, colors) {
        return $.map(values, function(val) { return colors.value(val); }).join(" ");
    }

    Global.CSSGenerators.color = function(values, colors) {
        return colors.fn("rgba", $.map(values, function(val, index) { 
            if (index < 3)
                return colors.value(Math.round(val * 255));
            return colors.value(val); 
        }));
    }

    Global.CSSGenerators.warpArray = function(values, colors) {
        return Global.WarpHelpers.generateWarpArray(values, colors);
    }

})();