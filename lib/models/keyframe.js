/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(){
    
    function Keyframe(filterList, time, value) {
        this.filterList = filterList;
        this.value = value;
        this.time = time;
        this.generated = false;
    }

    Keyframe.prototype = {
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
            $.each(configChange.changedValues, function(name, value) {
                console.log("changed ", filter, name, value);
                filterValues[name] = value;
            });
        }
    };

    Global.Keyframe = Keyframe;


})();