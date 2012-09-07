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