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
        this.colorColumnEl = $("<td class='color-preview' rowspan='4' />");
        this.colorPreviewEl = $("<div class='param-color-preview' />")
            .appendTo(this.colorColumnEl);

        this.createControls({
            "r": this.colorRange(0, this.colorColumnEl),
            "g": this.colorRange(1),
            "b": this.colorRange(2),
            "a": this.colorRange(3)
        });

        this.controls.addClass("param-color");
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
    }

    Global.Controls.register("color", ColorControl);

})();