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
