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

(function() {

	function VectorControlFactory(itemsCount) {

		function VectorControl(delegate, name, config) {
	        VectorControl.super.call(this, delegate, name, config);
	        this.init();
	    }

	    Global.Utils.extend(VectorControl).from(Global.MultiControl);

	    VectorControl.prototype.itemRange = function(field) {
	        return {
	            type: "range",
	            min: this.config.min,
	            max: this.config.max,
	            step: this.config.step,
	            field: field,
	        };
	    }

	    VectorControl.prototype.updateConfig = function(desc) {
	        $.each(this.subControls, function(i, control) {
	            control.updateConfig(desc);
	        });
	    }

	    VectorControl.prototype.init = function() {
	        var self = this,
	        	items = {},
	        	labels = ["x", "y", "z", "w"];
	        for (var i = 0; i < itemsCount; ++i)
	        	items[labels[i]] = this.itemRange(i);
	        this.createControls(items);
	    }

	    return VectorControl;
	}
    

    Global.Controls.register("vec2", VectorControlFactory(2));
    Global.Controls.register("vec3", VectorControlFactory(3));
    Global.Controls.register("vec4", VectorControlFactory(4));

})();