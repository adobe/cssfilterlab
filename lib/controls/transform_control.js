(function() {

    function TransformControl(delegate, name, config) {
        TransformControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(TransformControl).from(Global.MultiControl);

    TransformControl.prototype.rotationRange = function(field) {
        return {
            type: "range",
            min: -180,
            max: 180,
            step: 0.01,
            field: field
        };
    }

    TransformControl.prototype.init = function() {
        this.createControls({
            "rotateX": this.rotationRange("rotationX"),
            "rotateY": this.rotationRange("rotationY"),
            "rotateZ": this.rotationRange("rotationZ"),
        });
        this.controls.addClass("param-transform");
    }

    Global.Controls.register("transform", TransformControl);

})();