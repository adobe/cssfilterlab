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

    function TransformControl(delegate, name, config) {
        TransformControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(TransformControl).from(Global.MultiControl);

    TransformControl.prototype.range = function(field, min, max, step) {
        return {
            type: "range",
            min: min,
            max: max,
            step: step,
            field: field
        };
    }

    TransformControl.prototype.rotationRange = function(field) {
        return this.range(field, -180, 180, 1);
    }

    TransformControl.prototype.init = function() {
        this.createControls({
            "rotateX": this.rotationRange("rotationX"),
            "rotateY": this.rotationRange("rotationY"),
            "rotateZ": this.rotationRange("rotationZ"),
            "scale": this.range("scale", 0.0, 5, 0.1),
            "perspective": this.range("perspective", 0.0, 2000, 1)
        });
        this.controls.addClass("param-transform");
    }

    Global.Controls.register("transform", TransformControl);

})();
