(function() {
	
	function DockView(containerEl) {
		this.containerEl = containerEl.addClass("dock-root");
		DockView.super.call(this, null, "horizontal");
		Global.DockView.UsingNewFlexBox = (containerEl.css("display") == "-webkit-flex");
	}

	Global.Utils.extend(DockView).from(Global.DockColumn);
	
	$.extend(DockView.prototype, {
		minColumnSize: 350,
		
		add: function(panel) {
			var column = this.addVerticalColumn();
			return column.add(panel);
		}
	});

	Global.DockView = DockView;

})();