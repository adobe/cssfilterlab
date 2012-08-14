(function() {

    function WarpControl(delegate, name, config) {
        WarpControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(WarpControl).from(Global.BaseControl);

    WarpControl.prototype.init = function() {
        var desc = this.config,
            self = this;

        this.ctrl = $("<div/>")
                    .attr("id", "param-" + this.name);

        this.canvas = Global.WarpHelpers.buildWarpCanvas(this.ctrl, 180, 180, function() {
            self._onChange();
        });
    }

    WarpControl.prototype._onChange = function() {
        this.onValueChange();
    }

    WarpControl.prototype._updateControls = function() {
        var value = this.getValue();
        this.canvas.setPoints(value);
        this.canvas.redraw();
    }

    WarpControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, [this.ctrl]);
    }
    
    Global.Controls.register("warp", WarpControl);

})();