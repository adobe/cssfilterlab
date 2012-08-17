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

		setWidth: function(width) {
			this.el.css("-webkit-flex", 1)
				   .css("width", width);
			return this;
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
			var prev, next, startDimension, startOffset,
				dimension = (this.direction == "horizontal" ? "width" : "height"),
				dimensionReader = (this.direction == "horizontal" ? "outerWidth" : "outerHeight"),
				offsetName = (this.direction == "horizontal" ? "left" : "top"),
				self = this;
			var separator = $("<div />")
				.addClass("panel-separator")
				.draggable({ 
					helper: $("<div />"),
					start: function(event, ui) {
						next = separator.next();
						if (next.length == 0)
							return false;
						prev = separator.prev();
						if (prev.length == 0)
							return false;
						startOffset = ui.helper.offset()[offsetName];
						startDimension = prev[dimensionReader].call(prev);
						if (next.next().length == 1 && next.css("-webkit-flex") == "0 1 1px") {
							prev.css("-webkit-flex", 1);
							prev.css(dimension, startDimension);
							next.css("-webkit-flex", "");
							next.css("height", "");
						}
					},
					drag: function(event, ui) {
						prev.css("-webkit-flex", 1);
						prev.css(dimension, startDimension + (ui.offset[offsetName] - startOffset));
					},
					stop: function() {
						if (prev.data("container").isDocumentArea) {
							// Make sure that the document area is always flexible.
							var savedDimension = next[dimensionReader].call(next);
							next.css("-webkit-flex", 1);
							next.css(dimension, savedDimension);
							prev.css("-webkit-flex", "");
							prev.css("height", "");
						}
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