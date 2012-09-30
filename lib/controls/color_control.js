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

        this.colorColumnEl = $("<div class='color-preview' rowspan='4' />");
        this.colorPreviewEl = $("<input type='color' class='param-color-preview' />")
            .appendTo(this.colorColumnEl);

        this.hasColorInput = (function(self){
            var smiley = ":)"

            // a valid color input will sanitize the smiley
            return smiley !== self.colorPreviewEl.val(smiley).val()
        })(this);

        if (!this.hasColorInput)
            this.colorPreviewEl.attr("disabled", "disabled");

        this.colorPreviewEl.change(function () { self._onChange(); });

        this.createControls({
            "r": this.colorRange(0),
            "g": this.colorRange(1),
            "b": this.colorRange(2),
            "a": this.colorRange(3)
        });

        this.label = $("<span class='value-label'/>");
        this.editableLabel = this.createEditableLabel(this.label);
        this.controls.prepend(
            $("<tr/ >")
                .append($("<td />").text("Color"))
                .append($("<td />").append(this.colorColumnEl))
                .append($("<td class='field-value-label' />").append(this.label))
        );

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

    ColorControl.prototype.getValueForLabelEditor = function() {
        var v =  this.getValue();
        if (!v)
            return;

        var colors = [Math.floor(v[0] * 255),
                      Math.floor(v[1] * 255),
                      Math.floor(v[2] * 255)];
        var val = "#" +
                toBase16(colors[0]) +
                toBase16(colors[1]) +
                toBase16(colors[2]);

        return val;
    }

    ColorControl.prototype.setValueFromLabelEditor = function(inputValue) {
        var value = this.getValue();
        if (!value)
            return;
        if (inputValue.length < 7 || inputValue.charAt(0) != "#")
            return;
        var color = parseInt(inputValue.substr(1), 16);
        if (isNaN(color))
            return;

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
                      v[3]],
            colorCSS = "rgba(" + colors.join(", ") + ")";
        this.colorPreviewEl.css("background-color", "none");
        this.colorPreviewEl.css("background", "-webkit-linear-gradient(top, "+ colorCSS +" 0%, " + colorCSS + " 100%), url('style/img/color_bg.png')");

        var val = "#" +
                toBase16(colors[0]) +
                toBase16(colors[1]) +
                toBase16(colors[2]);
        this.colorPreviewEl.val(val);

        this.label.html(val);
     }

    Global.Controls.register("color", ColorControl);

})();
