(function() {
	
	function DockColumn(parent, direction) {
		DockColumn.super.call(this);

		this.parent = parent;
		this.direction = direction;
		this.items = [];

		this.init();
	}

	Global.Utils.extend(DockColumn).from(Global.EventDispatcher);

	$.extend(DockColumn.prototype, {
		init: function() {
			this.el = $("<div />")
				.addClass("panel-column")
				.addClass(this.direction);
			this.columnHandleEl = $("<div />")
				.addClass("panel-column-handle")
				.appendTo(this.el);
			this.columnItemsEl = $("<div />")
				.addClass("panel-column-items")
				.appendTo(this.el);
		},

		add: function(panel) {
			var container;
			if (!this.items.length)
				container = this.addContainer();
			else
				container = this.items[container.length - 1];
			container.add(panel);
			return container;
		},

		addSeparator: function() {
			var prev, startDimension, startOffset, 
				self = this;
			var separator = $("<div />")
				.addClass("panel-separator")
				.draggable({ 
					helper: $("<div />"),
					start: function(event, ui) {
						if (separator.next().length == 0)
							return false;
						prev = separator.prev();
						if (prev.length == 0)
							return false;
						if (self.direction == "horizontal") {
							startOffset = ui.helper.offset().left;
							startDimension = prev.outerWidth();
						} else {
							startOffset = ui.helper.offset().top;
							startDimension = prev.outerHeight();
						}
					},
					drag: function(event, ui) {
						prev.css("-webkit-flex", 1);
						if (self.direction == "horizontal")
							prev.css("width", startDimension + (ui.offset.left - startOffset));
						else
							prev.css("height", startDimension + (ui.offset.top - startOffset));
					}
				});
			this.columnItemsEl.append(separator);
		},

		addContainer: function() {
			if (!this.items.length)
				this.addSeparator();
			var container = new Global.DockContainer();
			this.items.push(container);
			this.columnItemsEl.append(container.el);
			container.column = this;
			this.addSeparator();
			return container;
		}

	});

	Global.DockColumn = DockColumn;

})();