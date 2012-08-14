(function() {
	
	function EventDispatcher() {
		this._events = {};
	}

	EventDispatcher.prototype = {
		fire: function(name, data) {
			var listeners = this.getListenersList(name);
			if (!listeners)
				return;
			var self = this;
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
		},

		off: function(name, fn) {
			var listeners = this.getListenersList(name),
				index = listeners.indexOf(fn);
			if (index == -1)
				return;
			listeners.splice(index, 1);
		}
	};

	Global.EventDispatcher = EventDispatcher;

})();