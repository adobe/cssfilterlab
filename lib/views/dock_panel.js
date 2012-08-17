(function() {
	
	function DockPanel(name) {
		DockPanel.super.call(this);
		this.name = name;
		this.initPanel();
		this.active = false;
	}

	Global.Utils.extend(DockPanel).from(Global.EventDispatcher);
	
	$.extend(DockPanel.prototype, {
		initPanel: function() {
			var self = this;
			this.el = $("<div />")
				.addClass("panel-view");
			this.tabEl = $("<div />")
				.addClass("panel-tab")
				.text(this.name)
				.click(function() {
					self.setActive(true);
				});
		},

		setActive: function(active) {
			this.active = active;
			this.el.toggleClass("active", active);
			this.tabEl.toggleClass("active", active);
			this.fire("activeStateChanged", [active]);
			if (active && this.container)
				this.container.setActiveTab(this);
		},

		setContainer: function(container) {
			this.container = container;
		}
	});

	Global.DockPanel = DockPanel;

})();