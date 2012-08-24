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
                if (!filter.active)
                    return;
                var filterName = filter.name;
                C[filterName] = filter.config.blendParams(A[filterName], B[filterName], position);
            });
            return resultKeyframe;
        },

        getFilterValues: function(filter) {
            return this.value[filter.name];
        },

        addFilterDefaultValue: function(filter) {
            this.value[filter.name] = Global.Utils.clone(filter.config.defaultValues());
        },

        removeFilterValue: function(filter) {
            delete this.value[filter.name];
        }        
    };

    Global.Keyframe = Keyframe;


})();