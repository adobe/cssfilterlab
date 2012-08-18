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
				.addClass(this.direction)
				.data("column", this);
			this.columnItemsEl = $("<div />")
				.addClass("panel-column-items")
				.appendTo(this.el);
		},

		setWidth: function(width) {
			this.el.css("-webkit-box-flex", "0")
				   .css("-webkit-flex", 1)
				   .css("width", width);
			return this;
		},

		setHeight: function(height) {
			this.el.css("-webkit-box-flex", "0")
			       .css("-webkit-flex", 1)
				   .css("height", height);
			return this;
		},

		_columnHandleEl: function() {
			if (!this.columnHandleEl) {
				this.columnHandleEl = $("<div />")
					.addClass("panel-column-header")
					.prependTo(this.el);
			}
			return this.columnHandleEl;
		},

		setTitle: function(title) {
			if (!this.columnTitleEl) {
				this.columnTitleEl = $("<div />")
					.addClass("panel-column-title")
					.appendTo(this._columnHandleEl());
			}
			this.columnTitleEl.text(title);
		},

		addCloseButton: function() {
			if (!this.columnCloseButtonEl) {
				this.columnCloseButtonEl = $("<button />")
					.addClass("panel-column-close-button")
					.text("Close")
					.prependTo(this._columnHandleEl())
					.click(this.onColumnCloseButtonClicked.bind(this));
			}
			return this;
		},

		onColumnCloseButtonClicked: function() {
			// Remove the items from the parent, so that we don't loose the events.
			this.columnItemsEl.detach();
			// Remove the separator first.
			this.el.prev().remove();
			this.el.remove();
			this.fire("columnClosed");
			$("body").trigger("dockViewResized", [this.parent.direction || "horizontal"]);
		},

		add: function(panel) {
			var container;
			if (!this.items.length)
				container = this.addContainer();
			else
				container = this.items[this.items.length - 1];
			container.add(panel);
			return container;
		},

		addSeparator: function() {
			var prev, next, startDimension, startOffset,
				dimension = (this.direction == "horizontal" ? "width" : "height"),
				dimensionReader = (this.direction == "horizontal" ? "outerWidth" : "outerHeight"),
				offsetName = (this.direction == "horizontal" ? "left" : "top"),
				min = 100, max,
				self = this;
			var separator = $("<div />")
				.addClass("panel-separator")
				.draggable({ 
					helper: $("<div />"),
					scroll: false,
					start: function(event, ui) {
						next = separator.next();
						if (next.length == 0)
							return false;
						prev = separator.prev();
						if (prev.length == 0)
							return false;
						startOffset = ui.helper.offset()[offsetName];
						startDimension = prev[dimensionReader].call(prev);
						max = self.columnItemsEl[dimensionReader].call(self.columnItemsEl) - (self.items.length - 1) * min;
						if (!next.next().length && 
								((Global.DockView.UsingNewFlexBox && next.css("-webkit-flex") == "0 1 1px") || 
								(!Global.DockView.UsingNewFlexBox && next.css("-webkit-box-flex") == "0")))
						{
							prev.css("-webkit-box-flex", "0")
								.css("-webkit-flex", 1)
								.css(dimension, startDimension);
							next.css("-webkit-box-flex", "1")
								.css("-webkit-flex", "")
								.css(dimension, "");
						} else {
							prev.css("-webkit-box-flex", "0")
								.css("-webkit-flex", 1);
						}
						if (!Global.DockView.UsingNewFlexBox) {
							// Workaround bug in WebKit where the new flex is only taken into account
							// when the flex box is recreated.
							self.el.css("display", "block");
							// Force a layout.
							self.el.css("display");
							self.el.css("display", "");
						}
					},
					drag: function(event, ui) {
						var newDimension = startDimension + (ui.offset[offsetName] - startOffset);
						prev.css(dimension, Math.min(max, Math.max(min, newDimension)));
						$("body").trigger("dockViewResized", [self.direction]);
					},
					stop: function() {
						if (prev.data("container").isDocumentArea) {
							// Make sure that the document area is always flexible.
							var savedDimension = next[dimensionReader].call(next);
							next.css("-webkit-box-flex", "0")
								.css("-webkit-flex", 1)
								.css(dimension, savedDimension);
							prev.css("-webkit-box-flex", "")
								.css("-webkit-flex", "")
								.css(dimension, "");
						}
					}
				});
			this.columnItemsEl.append(separator);
		},

		addContainer: function() {
			if (this.items.length)
				this.addSeparator();
			var container = new Global.DockContainer();
			this.items.push(container);
			this.columnItemsEl.append(container.el);
			container.column = this;
			return container;
		},

		addHorizontalColumn: function() {
			if (this.items.length)
				this.addSeparator();
			var container = new Global.DockColumn(this, "horizontal");
			this.items.push(container);
			this.columnItemsEl.append(container.el);
			container.column = this;
			return container;	
		},

		setIsDocumentArea: function() {
			this.isDocumentArea = true;
			return this;
		}

	});

	Global.DockColumn = DockColumn;

})();