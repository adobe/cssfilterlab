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

    Global.CSSGenerators = {};

    Global.CSSGenerators.identity = Global.Utils.identity;

    Global.CSSGenerators.transform = function(v, colors) {
        return [
        colors.fn("perspective", [colors.value(Global.Utils.checkDefaultNumber(v.perspective, 1000))]),
        colors.fn("scale", [colors.value(Global.Utils.checkDefaultNumber(v.scale, 1))]),
        colors.fn("rotateX", [colors.value(Global.Utils.checkDefaultNumber(v.rotationX, 0), "deg")]),
        colors.fn("rotateY", [colors.value(Global.Utils.checkDefaultNumber(v.rotationY, 0), "deg")]),
        colors.fn("rotateZ", [colors.value(Global.Utils.checkDefaultNumber(v.rotationZ, 0), "deg")])].join(" ");
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