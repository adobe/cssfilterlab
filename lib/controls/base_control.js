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

    function BaseControl(delegate, name, config) {
        this.delegate = delegate;
        this.name = name;
        this.config = config;
        this.params = null;
        this.field = config.hasOwnProperty("field") ? config.field : name;
    }

    BaseControl.prototype = {
        setSource: function(params) {
            this.params = params;
            this._updateControls();
        },

        _updateControls: function() { },

        setValue: function(value) {
            if (!this.params || this.params[this.field] == value)
                return;
            this.params[this.field] = value;
            this._updateControls();
            this.onValueChange();
        },

        onValueChange: function() {
            if (this.params && this.delegate && this.delegate.valuesUpdated)
                this.delegate.valuesUpdated(this.name);
        },

        getValue: function(value) {
            if (!this.params)
                return;
            return this.params[this.field];
        },

        pushControls: function(parent) { },

        pushTableColumns: function(parent, element, label) {
            if (!label) {
                $("<td colspan='2' class='field-column' />").append(element).appendTo(parent);
            } else {
                $("<td class='field-column' />").append(element).appendTo(parent);
                $("<td class='field-value-label' />").append(label).appendTo(parent);
            }
        },

        createEditableLabel: function(label) {
            return new Global.EditableLabel(this, label);
        },

        getValueForLabelEditor: function() {
            return this.getValue();
        },

        setValueFromLabelEditor: function(value) {
            this.setValue(value);
        }
    };

    var Controls = {
        _registeredControls: {},
        register: function(name, control) {
            this._registeredControls[name] = control;
        },

        get: function(typeName) {
            return this._registeredControls[typeName];
        }
    };

    Global.BaseControl = BaseControl;
    Global.Controls = Controls;

})();