(function() {
	function LoadingProgressView(el) {
		this.el = el;
		this.labelEl = el.find(".label");
		this.progressBarEl = el.find(".progress-bar");
		this.progressBarInteriorEl = $("<div />").addClass("progress-bar-interior").appendTo(this.progressBarEl);
	}

	LoadingProgressView.prototype = {
		setValue: function(value) {
			var progress = Math.round(Math.max(0, Math.min(1, value)) * 100) + "%";
			this.progressBarInteriorEl.css("width", progress);
			this.labelEl.text("Loading " + progress);
		},
		hide: function() {
			$(this.el).hide();
		}
	};

	Global.LoadingProgressView = LoadingProgressView;

})();