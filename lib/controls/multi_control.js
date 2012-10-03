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

    function MultiControl(delegate, name, config) {
        MultiControl.$super.call(this, delegate, name, config);
    }

    Global.Utils.extend(MultiControl).from(Global.BaseControl);

    MultiControl.prototype.createControls = function(controlConfig) {
        this.controls = $("<table class='multi-control-table' />");

        var subControls = [],
            self = this;

        $.each(controlConfig, function(name, config) {
            var ControlClass = Global.Controls.get(config.type);
            if (!ControlClass)
                return;
            
            var control = new ControlClass(self, name, config);
            subControls.push(control);

            var controlRowEl = $("<tr />").appendTo(self.controls),
                label = $("<td />").text(name).appendTo(controlRowEl);
            
            control.pushControls(controlRowEl);
            if (config.after)
                controlRowEl.append(config.after);
        });

        this.subControls = subControls;
    }

    MultiControl.prototype.valuesUpdated = function() {
        this.onValueChange();
        this.onMultiControlChanged();
    }

    MultiControl.prototype._updateControls = function() {
        var value = this.getValue();
        if (!value)
            return;
        this.onMultiControlChanged();
        $.each(this.subControls, function(i, control) {
            control.setSource(value);
        });
    }

    MultiControl.prototype.onMultiControlChanged = function() { }

    MultiControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, this.controls);
    }

    Global.MultiControl = MultiControl;

})();