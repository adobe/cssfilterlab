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

    function Filter(name, config) {
        Filter.$super.call(this);
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
            return !!this.config.isFork;
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