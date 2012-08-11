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
        // Make sure we are not reusing the old warp points, 
        // as they are changed now.
        this._emptyWarpPoints = null;
    }

    WarpControl.prototype.emptyWarpPoints = function() {
        if (!this._emptyWarpPoints)
            this._emptyWarpPoints = Global.WarpHelpers.generateWarpPoints();
        return this._emptyWarpPoints;
    }

    WarpControl.prototype._updateControls = function() {
        var value = this.getValue();
        if (!value) {
            // Fix for the null values.
            value = this.emptyWarpPoints();
            this.params[this.name] = value;
        }
        this.canvas.setPoints(value);
        this.canvas.redraw();
    }

    WarpControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, [this.ctrl]);
    }
    
    Global.Controls.register("warp", WarpControl);

})();