(function() {
	
	function DockContainer() {
		DockContainer.super.call(this);
		this.items = [];
		this.init();
	}

	Global.Utils.extend(DockContainer).from(Global.EventDispatcher);

	$.extend(DockContainer.prototype, {
		init: function() {
			this.el = $("<div />")
				.addClass("panel-container")
				.data("container", this);

			this.tabListEl = $("<div />")
				.addClass("panel-tab-list")
				.appendTo(this.el);
		},

		add: function(panel) {
			this.items.push(panel);
			this.tabListEl.append(panel.tabEl);
			this.el.append(panel.el);
			panel.setContainer(this);
			if (this.items.length == 1)
				panel.setActive(true);
			return this;
		},

		setHeight: function(height) {
			this.el.css("-webkit-box-flex", "0")
				   .css("-webkit-flex", 1)
				   .css("height", height);
			return this;
		},
		
		setActiveTab: function(tab) {
			$.each(this.items, function(i, item) {
				if (item == tab)
					return;
				item.setActive(false);
			});
		},

		setIsDocumentArea: function() {
			this.isDocumentArea = true;
			return this;
		},
		
		addClass: function(className) {
		    this.el.addClass(className)
		    return this;
		},
		
		removeTabs: function() {
		    this.tabListEl.remove()
		    return this;
		}
	});

	Global.DockContainer = DockContainer;

})();