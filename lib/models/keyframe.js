/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

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