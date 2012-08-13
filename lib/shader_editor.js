(function() {
	function ShaderEditor() {
		this.containerEl = $("#shader-editor");
		this.configEditorEl = this.containerEl.find(".config-editor .code-view");
		this.vertexShaderEditorEl = this.containerEl.find(".vertex-shader .code-view");
		this.fragmentShaderEditorEl = this.containerEl.find(".fragment-shader .code-view");

		this.vertexShaderErrorsEl = this.containerEl.find(".vertex-shader .code-bottom");
		this.fragmentShaderErrorsEl = this.containerEl.find(".fragment-shader .code-bottom");

		this.configEditor = new Global.CodeEditor(this.configEditorEl);

		this.vertexShaderEditor = new Global.CodeEditor(this.vertexShaderEditorEl, this.shaderChanged("vertex"));
		this.fragmentShaderEditor = new Global.CodeEditor(this.fragmentShaderEditorEl, this.shaderChanged("fragment"));

		this.angleLib = new Global.AngleLib();
		this.init();
	}

	ShaderEditor.prototype = {
		init: function() {
			var self = this;

			this.containerEl.dialog({
				autoOpen: false,
				minWidth: 400,
				minHeight: 300,
				width: 400,
				height: 300,
				title: "Shader editor",
				resize: function() {
					if (self.lastEditor)
						self.lastEditor.refresh();
				}
			});

			var panels = this.containerEl.find('.content > div'),
				editors = [this.configEditor, this.vertexShaderEditor, this.fragmentShaderEditor];
			this.containerEl.find(".tools_menu1 li").tabToggle(panels, {selectedClass: "selected"})
				.each(function(i) {
					$(this).click(function() {
						self.lastEditor = editors[i];
						self.lastEditor.refresh();
					});
				});
			this.lastEditor = this.configEditor;
		},

		show: function() {
			this.containerEl.dialog("open");
			this.lastEditor.refresh();
		},

		loadShaderFile: function(url, panel) {
			$.get(url, function(shader) {
				panel.setValue(shader);
			});
		},

		loadFilter: function(filter) {
			this.containerEl.dialog("option", "title", "Shader editor: " + filter.name);
			this.configEditor.setValue(JSON.stringify(filter.original, null, 4));
			if (filter.hasVertex)
				this.loadShaderFile("shaders/vertex/" + filter.name + ".vs", this.vertexShaderEditor);
			if (filter.hasFragment || !filter.hasVertex)
				this.loadShaderFile("shaders/fragment/" + filter.name + ".fs", this.fragmentShaderEditor);
			this.show();
		},

		shaderChanged: function(type) {
			var self = this,
				errorsPanel = type == "vertex" ? this.vertexShaderErrorsEl : this.fragmentShaderErrorsEl,
				errorLines = [];
			return function(editor, value) {
				errorsPanel.empty();
				$.each(errorLines, function(i, error) {
					// editor.setLineClass(error.pos.line, null, null);
					editor.clearMarker(error.lineHandle);
					error.marker.clear();
				});
				self.angleLib.compile(type, value, function(err, data) {
					if (err) {
						console.error(err);
						return;
					}
					// If the code changed since we requested this result, 
					// just ignore it.
					if (data.original != editor.getValue())
						return;
					if (!data.errors)
						errorsPanel.text("");
					else {
						$.each(data.errors, function(i, error) {
							$("<pre />")
								.append($("<span class='error-type' />").text(error.type))
								.append($("<span class='error' />").text(error.error))
								.appendTo(errorsPanel);
							var pos = editor.posFromIndex(error.index);
							//editor.setLineClass(pos.line, null, "error-line");
							var marker = editor.markText(pos, {
								line: pos.line,
								ch: pos.ch + 1
							}, "error-bookmark");
							var lineHandle = editor.setMarker(pos.line, "%N%", "error-line");
							errorLines.push({
								pos: pos,
								marker: marker,
								lineHandle: lineHandle
							});
						});
					}
				});
			};
		}
	}	

	Global.ShaderEditor = ShaderEditor;
})()