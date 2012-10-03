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

    function CheckboxControl(delegate, name, config) {
        CheckboxControl.$super.call(this, delegate, name, config);
        this.init();
    }

    CheckboxControl.lastEditorId = 0;

    Global.Utils.extend(CheckboxControl).from(Global.BaseControl);

    CheckboxControl.prototype.init = function() {
        var self = this,
            name = "checkbox-" + this.name + (CheckboxControl.lastEditorId++);
        this.ctrl = $("<input type='checkbox' />")
                    .attr("id", name)
                    .attr("name", name);
        this.ctrlLabel = $("<label />").attr("for", name).html("&nbsp;");

        this.ctrlParent = $("<div >").append(this.ctrl).append(this.ctrlLabel);

        this.ctrl.bind("change blur", function () { self._onChange(); });
    }

    CheckboxControl.prototype._onChange = function() {
        var val = this.ctrl.attr("checked") == "checked";
        this.setValue(val ? 1 : 0, false);
    };

    CheckboxControl.prototype._updateControls = function() {
        var value = this.getValue();
        if (!value)
            this.ctrl.removeAttr("checked");
        else    
            this.ctrl.attr("checked", "checked");
    }

    CheckboxControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, this.ctrlParent);
    }

    Global.Controls.register("checkbox", CheckboxControl);


})();