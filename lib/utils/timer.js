(function() {
	
	function Timer(timeout) {
		Timer.super.call(this);
		this.timeout = timeout;
		this.args = null;
		this.timer = null;
		this.timerCallback = this.onTimerFired.bind(this);
	}

	Global.Utils.extend(Timer).from(Global.EventDispatcher);

	$.extend(Timer.prototype, {
		invoke: function(args) {
			this.args = args;
			this.clearTimer();
			this.installTimer();
			console.log("installing timer");
		},

		clearTimer: function() {
			clearTimeout(this.timer);
			this.timer = null;
		},

		installTimer: function() {
			this.timer = setTimeout(this.timerCallback, this.timeout);
		},

		onTimerFired: function() {
			this.timer = null;
			console.log("timer fired");
			this.fire("timerFired", this.args);
		}
	});

	Global.Timer = Timer;

})();