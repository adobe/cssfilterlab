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
	
	function EventDispatcher() {
		this._events = {};
	}

	EventDispatcher.prototype = {
		fire: function(name, data) {
			var listeners = this.getListenersList(name),
				self = this;
			if (!listeners)
				return;
			listeners = $.map(listeners, function(fn) { return fn; });
			$.each(listeners, function(i, fn) {
				if (data)
					fn.apply(this, data);
				else
					fn.call(this);
			});
		},

		getListenersList: function(name, create) {
			if (create && !this._events[name])
				this._events[name] = [];
			return this._events[name];
		},

		on: function(name, fn) {
			var listeners = this.getListenersList(name, true);
			if (listeners.indexOf(fn) != -1)
				return;
			listeners.push(fn);
			return fn;
		},

		off: function(name, fn) {
			var listeners = this.getListenersList(name),
				index = listeners.indexOf(fn);
			if (index == -1)
				return;
			listeners.splice(index, 1);
			return fn;
		}
	};

	Global.EventDispatcher = EventDispatcher;

})();