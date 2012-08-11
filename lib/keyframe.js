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

        makeGeneratedClone: function() {
            var keyframe = new Global.Keyframe(this.filterList, this.time, Global.cloneFrame(this.value));
            keyframe.generated = true;
            return keyframe;
        },

        blend: function(otherKeyframe, position) {
            var self = this,
                resultKeyframe = this.makeGeneratedClone(),
                A = self.value,
                B = otherKeyframe.value,
                C = resultKeyframe.value;
            $.each(this.filterList.filters, function(filter) {
                var filterName = filter.name;
                C[filterName] = filter.blendParams(A[filterName], B[filterName], position);
            });
            return resultKeyframe;
        }
    };

    Global.Keyframe = Keyframe;


})();