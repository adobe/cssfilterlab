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