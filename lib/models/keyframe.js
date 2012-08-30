(function(){
    
    function Keyframe(filterList, time, value) {
        this.filterList = filterList;
        this.value = value;
        this.time = time;
        this.generated = false;
    }

    Keyframe.prototype = {
        generateKeyframeElement: function() {
            return $("<div class='keyframe'></div>").css("left", time + "px");
        },

        makeGeneratedClone: function(time) {
            var keyframe = new Global.Keyframe(this.filterList, time, Global.Utils.clone(this.value));
            keyframe.generated = true;
            return keyframe;
        },

        blend: function(otherKeyframe, position, time) {
            var self = this,
                resultKeyframe = this.makeGeneratedClone(time),
                A = self.value,
                B = otherKeyframe.value,
                C = resultKeyframe.value;
            $.each(this.filterList.filters, function(index, filter) {
                if (!filter.active || filter.config.isLoading)
                    return;
                var filterName = filter.name;
                C[filterName] = filter.config.blendParams(A[filterName], B[filterName], position);
            });
            return resultKeyframe;
        },

        getFilterValues: function(filter) {
            if (!this.value.hasOwnProperty(filter.name))
                this.value[filter.name] = {};
            return this.value[filter.name];
        },

        addFilterDefaultValue: function(filter) {
            this.value[filter.name] = Global.Utils.clone(filter.config.defaultValues());
        },

        removeFilterValue: function(filter) {
            delete this.value[filter.name];
        },

        updateKeyframeAfterConfigChange: function(filter, configChange) {
            var filterValues = this.getFilterValues(filter);
            $.each(configChange.deletedKeys, function(i, name) {
                delete filterValues[name];
            });
            $.each(configChange.addedValues, function(name, value) {
                if (filterValues.hasOwnProperty(name))
                    return;
                filterValues[name] = value;
            });
        }
    };

    Global.Keyframe = Keyframe;


})();