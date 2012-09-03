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

        pushTableColumns: function(parent, elements) {
            $.each(elements, function(i, el) {
                $("<td />").append(el).appendTo(parent);
            });
        },

        createEditableLabel: function(label) {
            return new Global.EditableLabel(this, label);
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