(function() {
	
	function DockView(containerEl) {
		DockView.super.call(this);

		this.containerEl = containerEl;
		this.columns = [];

		this.containerEl.addClass("dock-root");
	}

	Global.Utils.extend(DockView).from(Global.EventDispatcher);
	
	$.extend(DockView.prototype, {
		add: function(panel) {
			var column = this.addColumn();
			return column.add(panel);
		},

		addColumn: function() {
			if (this.columns.length)
				this.addSeparator();
			var column = new Global.DockColumn(this, "vertical");
			column.on("columnClosed", this.onColumnClosed.bind(this, column));
			this.columns.push(column);
			this.containerEl.append(column.el);
			$("body").trigger("dockViewResized", ["horizontal"]);
			return column;
		},

		onColumnClosed: function(column) {
			var index = this.columns.indexOf(column);
			if (index == -1)
				return;
			this.columns.splice(index, 1);
		},

		addSeparator: function() {
			var prev, next, startWidth, startOffset,
				min, max, self = this;
			var separator = $("<div />")
				.addClass("panel-separator")
				.draggable({ 
					axis: "x",
					scroll: false,
					helper: $("<div />"),
					start: function(event, ui) {
						next = separator.next();
						if (next.length == 0)
							return false;
						prev = separator.prev();
						if (prev.length == 0)
							return false;
						startWidth = prev.outerWidth();
						startOffset = ui.helper.offset().left;
						if (!next.next().length && next.css("-webkit-flex") == "0 1 1px") {
							prev.css("-webkit-flex", 1);
							prev.css("width", startWidth);
							next.css("-webkit-flex", "");
							next.css("width", "");
						}
						min = 350;
						max = self.containerEl.width() - (self.columns.length - 1) * min;
					},
					drag: function(event, ui) {
						prev.css("-webkit-flex", 1);
						var newDimension = startWidth + (ui.offset.left - startOffset);
						prev.css("width", Math.min(max, Math.max(min, newDimension)));
						$("body").trigger("dockViewResized", ["horizontal"]);
					},
					stop: function() {
						if (prev.data("column").isDocumentArea) {
							// Make sure that the document area is always flexible.
							var savedDimension = next.outerWidth();
							next.css("-webkit-flex", 1);
							next.css("width", savedDimension);
							prev.css("-webkit-flex", "");
							prev.css("width", "");
						}
					}
				});
			this.containerEl.append(separator);
		}
	});

	DockView.test = function () {
		var dockView = new Global.DockView($("#dock-view"));
		var panel1 = new Global.DockPanel("panel1");
		dockView.add(panel1);

		var panel1_1 = new Global.DockPanel("panel1-1");
		var panel1_2 = new Global.DockPanel("panel1-2");
		panel1.container.add(panel1_1);
		panel1.container.add(panel1_2);


		var panel2 = new Global.DockPanel("panel1");
		dockView.add(panel2);
		var panel2_1 = new Global.DockPanel("panel2-1");
		var panel2_2 = new Global.DockPanel("panel2-2");
		panel2.container.add(panel2_1);
		panel2.container.add(panel2_2);

		var container2 = panel2.container.column.addContainer();

		var panel3 = new Global.DockPanel("panel1");
		container2.add(panel3);

		var panel4 = new Global.DockPanel("panel4");
		container2.add(panel4);
	}

	Global.DockView = DockView;

})();