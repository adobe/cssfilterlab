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

(function(){

    var mixers = {
        mixNumber: function(a, b, t) {
            return a * (1 - t) + b * t;
        },
        
        mixVector: function(a, b, t) {
            var r = [];
            for (var i=0; i<a.length; ++i)
                r.push(mixers.mixNumber(a[i], b[i], t));
            return r;
        },
        
        mixVectorOfVectors: function(a, b, t) {
            var r = [];
            for (var i=0; i < a.length; ++i) {
                var row = []; r.push(row);
                var l2 = a[i].length;
                for (var j=0; j < l2; ++j)
                    row.push(Global.mixers.mixVector(a[i][j], b[i][j], t));
            }
            return r;
        },
        
        mixHash: function(fn) {
            var mixFn = Global.mixers[fn];
            return function(a, b, t) {
                var r = {};
                $.each(a, function(key, valueA) {
                    r[key] = mixFn(valueA, b[key], t);
                });
                return r;
            }
        },
        
        dontMix: function(a, b, t) {
            return a;
        }
    };

    Global.mixers = mixers;
})();