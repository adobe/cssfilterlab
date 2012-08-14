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