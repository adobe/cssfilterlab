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

    function ColorControl(delegate, name, config) {
        ColorControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(ColorControl).from(Global.MultiControl);

    ColorControl.prototype.colorRange = function(field, after) {
        return {
            type: "range",
            min: 0,
            max: 1,
            step: 0.01,
            field: field,
            after: after
        };
    }

    ColorControl.prototype.init = function() {
        var self = this;

        this.colorColumnEl = $("<td class='color-preview' rowspan='4' />");
        this.colorPreviewEl = $("<input type='color' class='param-color-preview' />")
            .appendTo(this.colorColumnEl);

        this.colorPreviewEl.change(function () { self._onChange(); });

        this.createControls({
            "r": this.colorRange(0, this.colorColumnEl),
            "g": this.colorRange(1),
            "b": this.colorRange(2),
            "a": this.colorRange(3)
        });

        this.controls.addClass("param-color");
    }

    ColorControl.prototype._onChange = function() {
        var value = this.getValue();
        if (!value)
            return;
        var color = parseInt(this.colorPreviewEl.val().substr(1), 16);
        value[0] = ((color & 0xFF0000) >> 16) / 255;
        value[1] = ((color & 0x00FF00) >> 8) / 255;
        value[2] = ((color & 0x0000FF)) / 255;
        this.onValueChange();
        this._updateControls();
    }

    function toBase16(val) {
        var b16 = Math.round(val).toString(16);
        return (b16.length == 1) ? "0" + b16 : b16;
    }

    ColorControl.prototype.onMultiControlChanged = function() {
        var v = this.getValue();
        if (!v)
            return;
        var colors = [Math.floor(v[0] * 255),
                      Math.floor(v[1] * 255),
                      Math.floor(v[2] * 255),
                      v[3]];
        this.colorPreviewEl.css("background-color", "rgba(" + colors.join(", ") + ")");

        var val = "#" +
                toBase16(colors[0]) +
                toBase16(colors[1]) +
                toBase16(colors[2]);
        this.colorPreviewEl.val(val);
    }

    Global.Controls.register("color", ColorControl);

})();