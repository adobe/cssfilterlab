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

    function MultiControl(delegate, name, config) {
        MultiControl.super.call(this, delegate, name, config);
    }

    Global.Utils.extend(MultiControl).from(Global.BaseControl);

    MultiControl.prototype.createControls = function(controlConfig) {
        this.controls = $("<table />");

        var subControls = [],
            self = this;

        $.each(controlConfig, function(name, config) {
            var controlClass = Global.Controls.get(config.type);
            if (!controlClass)
                return;
            
            var control = new controlClass(self, name, config);
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
        this.pushTableColumns(parent, [this.controls]);
    }

    Global.MultiControl = MultiControl;

})();