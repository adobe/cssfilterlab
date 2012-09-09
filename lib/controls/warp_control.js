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

    function WarpControl(delegate, name, config) {
        WarpControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(WarpControl).from(Global.BaseControl);

    WarpControl.prototype.init = function() {
        var desc = this.config,
            self = this;

        this.ctrl = $("<div/>")
                    .attr("id", "param-" + this.name);

        this.canvas = Global.WarpHelpers.buildWarpCanvas(this.ctrl, 180, 180, function() {
            self._onChange();
        });
    }

    WarpControl.prototype._onChange = function() {
        this.onValueChange();
    }

    WarpControl.prototype._updateControls = function() {
        var value = this.getValue();
        if (!(value instanceof Array) && !(value instanceof Global.ActiveCollection))
            return;
        this.canvas.setPoints(value);
        this.canvas.redraw();
    }

    WarpControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, [this.ctrl]);
    }
    
    Global.Controls.register("warp", WarpControl);

})();