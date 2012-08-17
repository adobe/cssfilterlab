(function() {
	function ShaderEditorView(filterList) {
		this.filterList = filterList;

		this.configEditorEl = $("#config-editor .code-view");
		this.vertexShaderEditorEl = $("#vertex-shader .code-view");
		this.fragmentShaderEditorEl = $("#fragment-shader .code-view");

		this.vertexShaderErrorsEl = $("#vertex-shader .code-bottom");
		this.fragmentShaderErrorsEl = $("#fragment-shader .code-bottom");

		this.configEditor = new Global.CodeEditor(this.configEditorEl);

		this.angleLib = new Global.AngleLib();

		this.vertexShaderEditor = new Global.ShaderCodeEditorView(this.angleLib, "vertex",
				this.vertexShaderEditorEl, this.vertexShaderErrorsEl);

		this.fragmentShaderEditor = new Global.ShaderCodeEditorView(this.angleLib, "fragment",
				this.fragmentShaderEditorEl, this.fragmentShaderErrorsEl);
		
		this.vertexShaderEditor.on("valueChanged", this.onShaderTextChanged.bind(this, "vertex"));
		this.fragmentShaderEditor.on("valueChanged", this.onShaderTextChanged.bind(this, "fragment"));

		this.configDockPanel = new Global.DockPanel("Filter Configuration");
		$("#config-editor").appendTo(this.configDockPanel.el);
		this.configDockPanel.on("activeStateChanged", this.onActiveStateChanged.bind(this, this.configEditor));

		this.vertexDockPanel = new Global.DockPanel("Vertex Shader");
		$("#vertex-shader").appendTo(this.vertexDockPanel.el);
		this.vertexDockPanel.on("activeStateChanged", this.onActiveStateChanged.bind(this, this.vertexShaderEditor));

		this.fragmentDockPanel = new Global.DockPanel("Fragment Shader");
		$("#fragment-shader").appendTo(this.fragmentDockPanel.el);
		this.fragmentDockPanel.on("activeStateChanged", this.onActiveStateChanged.bind(this, this.fragmentShaderEditor));
		
		this.onWindowResizedCallback = this.onWindowResized.bind(this);
        this.onDockResizedCallback = this.onDockResized.bind(this);

		this.init();

		this.panelsAdded = false;
	}

	ShaderEditorView.prototype = {
		init: function() {
			var self = this;
		},

		show: function() {
			if (!this.panelsAdded) {
				this.panelsAdded = true;
				this.dockView.add(this.configDockPanel)
							 .add(this.vertexDockPanel)
							 .add(this.fragmentDockPanel)
							 .column.addCloseButton().on("columnClosed", this.onColumnClosed.bind(this));
				$("body").bind("dockViewResized", this.onDockResizedCallback);
	            window.addEventListener("resize", this.onWindowResizedCallback, false);
			}
		},

		onColumnClosed: function() {
			$("body").unbind("dockViewResized", this.onDockResizedCallback);
            window.removeEventListener("resize", this.onWindowResizedCallback, false);
            this.panelsAdded = false;
		},

		loadShaderFile: function(url, panel) {
			$.get(url, function(shader) {
				panel.setValue(shader);
			});
		},

		loadFilter: function(filter) {
			this.filter = filter;
			this.configEditor.setValue(JSON.stringify(filter.original, null, 4));
			if (filter.edited_vertex)
				this.vertexShaderEditor.setValue(filter.editedSource_vertex);
			else if (filter.hasVertex)
				this.loadShaderFile("shaders/vertex/" + filter.forkedFilter.name + ".vs", this.vertexShaderEditor);
			else
				this.vertexShaderEditor.setValue("");
			if (filter.edited_fragment)
				this.fragmentShaderEditor.setValue(filter.editedSource_fragment);
			else if (filter.hasFragment || !filter.hasVertex)
				this.loadShaderFile("shaders/fragment/" + filter.forkedFilter.name + ".fs", this.fragmentShaderEditor);
			else
				this.fragmentShaderEditor.setValue("");
			this.show();
			this.configDockPanel.container.column.setTitle("Editing shader: " + filter.name);
			if (this.lastEditor)
				this.lastEditor.refresh();
		},

		onShaderTextChanged: function(type, newValue) {
			this.filterList.filterUpdate(this.filter, type, newValue);
		},

		onWindowResized: function() {
			if (!this.lastEditor)
				return;
            this.lastEditor.refresh();
        },

        onDockResized: function(ev, direction) {
            if (!this.lastEditor || direction != "vertical")
                return; 
            this.lastEditor.refresh();
        },

        onActiveStateChanged: function(editor, active) {
        	if (active) {
        		this.lastEditor = editor;
	        	this.lastEditor.refresh();
	        }
        }

	}	

	Global.ShaderEditorView = ShaderEditorView;
})()