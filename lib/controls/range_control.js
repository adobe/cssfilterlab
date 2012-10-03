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

    function RangeControl(delegate, name, config) {
        RangeControl.$super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(RangeControl).from(Global.BaseControl);

    RangeControl.prototype.init = function() {
        var self = this;

        this.label = $("<span class='value-label'/>");
        this.editableLabel = this.createEditableLabel(this.label);

        this.ctrl = $("<input type='range' />")
                    .attr("id", "range-" + this.name)
                    .attr("class", "range-" + this.name)
                    .attr("value", "");
        this.updateConfig(this.config);
        this.ctrl.change(function () { self._onChange(); });
    }

    RangeControl.prototype.updateConfig = function(desc) {
        this.ctrl.attr("min", desc.min)
            .attr("max", desc.max)
            .attr("step", desc.step);
    }

    RangeControl.prototype._onChange = function() {
        var val = parseFloat(this.ctrl.val());
        if (isNaN(val))
            val = 0;
        this.setValue(val, false);
    }

    RangeControl.prototype._updateControls = function() {
        var value = parseFloat(this.getValue());
        if (isNaN(value))
            value = 0;
        this.label.html(Math.round(100 * value) / 100);
        this.ctrl.val(value);
    }

    RangeControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, this.ctrl, this.label);
    }

    RangeControl.prototype.validate = function(value) {
        var val = parseFloat(value);
        if (isNaN(value) || value < this.min || value > this.max)
            return null;
        return val;
    }
    
    Global.Controls.register("range", RangeControl);

})();