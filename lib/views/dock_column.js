/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
		minColumnSize: 100,

		init: function() {
			this.el = (this.containerEl || $("<div />"))
				.addClass("panel-column")
				.addClass(this.direction)
				.data("item", this);
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

		setMinSize: function(minSize) {
			this.minSize = minSize;
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
				this.columnCloseButtonEl = $("<a href='#' />")
					.addClass("panel-column-close-button")
					.addClass("icon icon-close")
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

		hasFollowingResizeableContainer: function(nextItem) {
			var i = this.items.indexOf(nextItem);
			if (i == -1)
				return;
			++i;
			for (; i < this.items.length; ++i) {
				if (!this.items[i].isFixed)
					return true;
			}
			return false;
		},

		minItemSize: function(item) {
			if (item.minSize !== undefined)
				return item.minSize;
			return this.minColumnSize;
		},

		addSeparator: function() {
			var prev, next, nextItem, prevItem, startDimension, startOffset,
				dimension = (this.direction == "horizontal" ? "width" : "height"),
				dimensionReader = (this.direction == "horizontal" ? "outerWidth" : "outerHeight"),
				offsetName = (this.direction == "horizontal" ? "left" : "top"),
				min, max,
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
						nextItem = next.data("item");
						prevItem = prev.data("item");
						startOffset = ui.helper.offset()[offsetName];
						startDimension = prev[dimensionReader].call(prev);
						var separtorDimension = separator[dimensionReader].call(separator);
						var nextStartDimension = next[dimensionReader].call(next);
						max = (nextStartDimension - self.minItemSize(nextItem) + startDimension - separtorDimension);
						min = self.minItemSize(prevItem);
						if (!self.hasFollowingResizeableContainer(nextItem) && 
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
						self.fire("columnResized", [dimension])
					},
					stop: function() {
						if (prevItem.isDocumentArea) {
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

		addSeparatorIfNeeded: function() {
			if (this.items.length && !this.items[this.items.length - 1].isFixed)
				this.addSeparator();
		},

		addContainer: function(fixed) {
			if (fixed !== true)
				this.addSeparatorIfNeeded();
			var container = new Global.DockContainer();
			this.items.push(container);
			this.columnItemsEl.append(container.el);
			container.column = this;
			return container;
		},

		addVerticalColumn: function() {
			return this._addColumn("vertical");
		},

		addHorizontalColumn: function() {
			return this._addColumn("horizontal");
		},

		_addColumn: function(orientation) {
			this.addSeparatorIfNeeded();
			var column = new Global.DockColumn(this, orientation);
			this.items.push(column);
			this.columnItemsEl.append(column.el);
			column.column = this;
			column.on("columnClosed", this.onColumnClosed.bind(this, column));
			return column;
		},

		onColumnClosed: function(column) {
			var index = this.items.indexOf(column);
			if (index == -1)
				return;
			this.items.splice(index, 1);
		},

		setIsDocumentArea: function() {
			this.isDocumentArea = true;
			return this;
		},
		
		addClass: function(className) {
		    this.el.addClass(className)
		    return this;
		},

		setFixed: function() {
			this.isFixed = true;
			return this;
		}

	});

	Global.DockColumn = DockColumn;

})();