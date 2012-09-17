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

    function TextControl(delegate, name, config) {
        TextControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(TextControl).from(Global.BaseControl);

    TextControl.prototype.init = function() {
        var self = this;

        this.validatorEl = $("<div />");

        this.ctrl = $("<input type='text' />")
                    .attr("id", "text-" + this.name)
                    .attr("value", "");
        this.ctrl.bind("change click blur", function (ev) { self._onChange(ev); });
    }

    TextControl.prototype._onChange = function(ev) {
        var val = this.ctrl.val();
        if (this.validate(val) === null) {
            if (ev.type == "blur")
                this._updateControls();
            return;
        }
        this.setValue(val, false);
    };

    TextControl.prototype._updateControls = function() {
        var value = this.getValue();
        this.ctrl.val(value);
    }

    TextControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, [this.ctrl]);
    }

    TextControl.prototype.validate = function(value) {
        this.validatorEl.css("-webkit-filter", "none");
        this.validatorEl.css("-webkit-filter", "custom(url(test), t " + value + ")");
        
        var parsedValue = this.validatorEl.css("-webkit-filter");
        console.log(parsedValue);
        if (parsedValue === null || parsedValue == "none")
            return null;
        return value;
    }
    
    Global.Controls.register("unknown", TextControl);
    Global.Controls.register("text", TextControl);

})();