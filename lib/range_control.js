(function() {

    function RangeControl(delegate, name, config) {
        RangeControl.super.call(this, delegate, name, config);
        this.init();
    }

    Global.Utils.extend(RangeControl).from(Global.BaseControl);

    RangeControl.prototype.init = function() {
        var desc = this.config,
            self = this;

        this.min = desc.min ? desc.min : 0;
        this.max = desc.max ? desc.max : 1;
        this.step = desc.step ? desc.step : 0.1;

        this.label = $("<span class='value-label'/>");
        this.editableLabel = this.createEditableLabel(this.label);

        this.ctrl = $("<input type='range' />")
                    .attr("id", "range-" + this.name)
                    .attr("min", this.min)
                    .attr("max", this.max)
                    .attr("value", "")
                    .attr("step", this.step);
        this.ctrl.change(function () { self._onChange(); });
    }

    RangeControl.prototype._onChange = function() {
        this.setValue(parseFloat(this.ctrl.val()), false);
    }

    RangeControl.prototype._updateControls = function() {
        var value = this.getValue();
        this.label.html(Math.round(100 * value) / 100);
        this.ctrl.val(value);
    }

    RangeControl.prototype.pushControls = function(parent) {
        this.pushTableColumns(parent, [this.ctrl, this.label]);
    }

    RangeControl.prototype.validate = function(value) {
        var val = parseFloat(value);
        if (isNaN(value) || value < this.min || value > this.max)
            return null;
        return val;
    }
    
    Global.Controls.register("range", RangeControl);

})();