(function(){

    function Filter(name, config) {
        Filter.super.call(this);
        this.name = name;
        this.config = config;
        this.active = false;
    }

    Global.Utils.extend(Filter).from(Global.EventDispatcher);

    $.extend(Filter.prototype, {
        filterType: function() {
            return this.config.type ? this.config.type.fn : "custom";
        },

        isBuiltin: function() {
            return this.config.isBuiltin;
        },

        isFork: function() {
            return this.config.isFork;
        },

        toggleFilter: function() {
            this.setActive(!this.active);
        },

        setActive: function(value) {
            if (this.active == value)
                return;
            this.active = value;
            this.fire("filterStateChanged", [this.active]);
        },

        setSource: function(value) {
            this.source = value;
            this.fire("filterSourceChanged", [value]);
        },

        valuesUpdated: function(paramName) {
            this.fire("valuesUpdated", [paramName]);
        },

        removeFilter: function() {
            this.fire("filterRemoved");
        }
    });

    Global.Filter = Filter;

})()