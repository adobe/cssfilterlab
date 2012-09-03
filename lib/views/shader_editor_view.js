(function() {
	function ShaderEditorView(filterList, github) {
		this.filterList = filterList;
        this.github = github;

		this.configEditorEl = $("#config-editor .code-view");
		this.vertexShaderEditorEl = $("#vertex-shader .code-view");
		this.fragmentShaderEditorEl = $("#fragment-shader .code-view");

		this.errorsEl = $("#shader-errors");
		this.vertexShaderErrorsEl = $("#shader-errors .vertex-shader");
		this.fragmentShaderErrorsEl = $("#shader-errors .fragment-shader");

		this.reloadButtonEl = $("#reload-button");
		this.reloadButtonEl.click(this.onReloadButtonClicked.bind(this));

        this.saveAnonymousGistEl = $("#post-gist-button");
        this.saveAnonymousGistEl.click(this.onSaveAnonymousGistClicked.bind(this));   

        this.githubPopupEl = $("#github-popup");
        this.githubLinkEl = $("#gist-link");
        this.githubPopupCloseEl = $("#gist-popup-close");
        this.githubPopupCloseEl.click(this.onCloseGistPopupClicked.bind(this));   

		this.configEditor = new Global.CodeEditor(this.configEditorEl);

		this.loaderView = new Global.LoadingProgressView($("#shader-errors .loader"));
		this.angleLib = new Global.AngleLib();
		this.angleLib.on("progress", this.onAngleLibLoadingProgress.bind(this));
		this.angleLib.on("completed", this.onAngleLibLoadingCompleted.bind(this));

		this.vertexShaderEditor = new Global.ShaderCodeEditorView(this.angleLib, "vertex",
				this.vertexShaderEditorEl, this.vertexShaderErrorsEl);

		this.fragmentShaderEditor = new Global.ShaderCodeEditorView(this.angleLib, "fragment",
				this.fragmentShaderEditorEl, this.fragmentShaderErrorsEl);
		
		this.vertexShaderEditor.on("valueChanged", this.onShaderTextChanged.bind(this, "vertex"));
        this.vertexShaderEditor.on("uniformsDetected", this.onShaderUniformsDetected.bind(this, "vertex"));

		this.fragmentShaderEditor.on("valueChanged", this.onShaderTextChanged.bind(this, "fragment"));
        this.fragmentShaderEditor.on("uniformsDetected", this.onShaderUniformsDetected.bind(this, "fragment"));

        this.configEditor.on("valueChanged", this.reload.bind(this));

		this.configDockPanel = new Global.DockPanel("Filter Configuration");
		$("#config-editor").appendTo(this.configDockPanel.el);
		this.configDockPanel.on("activeStateChanged", this.onActiveStateChanged.bind(this, this.configEditor));

		this.vertexDockPanel = new Global.DockPanel("Vertex Shader");
		$("#vertex-shader").appendTo(this.vertexDockPanel.el);
		this.vertexDockPanel.on("activeStateChanged", this.onActiveStateChanged.bind(this, this.vertexShaderEditor));

		this.fragmentDockPanel = new Global.DockPanel("Fragment Shader");
		$("#fragment-shader").appendTo(this.fragmentDockPanel.el);
		this.fragmentDockPanel.on("activeStateChanged", this.onActiveStateChanged.bind(this, this.fragmentShaderEditor));

		this.errorsDockPanel = new Global.DockPanel("Errors");
		this.errorsEl.appendTo(this.errorsDockPanel.el);
		
		this.onWindowResizedCallback = this.onWindowResized.bind(this);
        this.onDockResizedCallback = this.onDockResized.bind(this);

		this.panelsAdded = false;
	}

	ShaderEditorView.prototype = {
		
		onAngleLibLoadingProgress: function(value) {
			this.loaderView.setValue(value);
		},

		onAngleLibLoadingCompleted: function() {
			this.loaderView.hide();
		},

		show: function() {
			if (!this.panelsAdded) {
				this.panelsAdded = true;
				this.dockView.add(this.configDockPanel)
							 .add(this.vertexDockPanel)
							 .add(this.fragmentDockPanel)
							 .column.addCloseButton()
							 .addContainer().add(this.errorsDockPanel).setHeight(200)
							 .column.on("columnClosed", this.onColumnClosed.bind(this));
				$("body").bind("dockViewResized", this.onDockResizedCallback);
	            window.addEventListener("resize", this.onWindowResizedCallback, false);
			}
		},

		onColumnClosed: function() {
			$("body").unbind("dockViewResized", this.onDockResizedCallback);
			window.removeEventListener("resize", this.onWindowResizedCallback, false);
			this.configDockPanel.active = this.vertexDockPanel.active = this.fragmentDockPanel.active = this.errorsDockPanel.active = false;
            this.panelsAdded = false;
		},

		loadFilter: function(filter) {
            // Prevent change events while loading first version.
            this.filter = null;

			this.configEditor.setValue(JSON.stringify(filter.original, null, 4));
			
			this.vertexShaderEditor.setValue(filter.editedSource_vertex || "");
			this.fragmentShaderEditor.setValue(filter.editedSource_fragment || "");

            this.filter = filter;

			this.show();
			this.configDockPanel.container.column.setTitle("Editing shader: " + filter.label);
			if (this.lastEditor)
				this.lastEditor.refresh();
		},

		onShaderTextChanged: function(type, newValue) {
            if (!this.filter)
                return;
            this.filterList.filterUpdate(this.filter, type, newValue);
		},

        defaultUniforms: ["u_meshBox", "u_tileSize", "u_meshSize", "u_projectionMatrix", "u_texture", "u_textureSize", "u_contentTexture"],
        onShaderUniformsDetected: function(type, uniforms) {
            if (!this.filter)
                return;
            var self = this,
                hadChanges = false;
            $.each(uniforms, function(i, uniform) {
                if (self.defaultUniforms.indexOf(uniform.name) != -1)
                    return;
                if (self.addUniform(uniform))
                    hadChanges = true;
            });
            if (hadChanges) 
                this.updateFilterConfig();
        },

        addUniform: function(uniform) {
            var config = null,
                defaultValue = null;
            switch (uniform.type) {
            case "vec4":
                // color? 
                config = {
                    type: 'color',
                    mixer: 'mixVector',
                    generator: 'vector'
                };
                defaultValue = [0, 0, 0, 1];
                break;
            case "float":
                config = {
                    type: 'range',
                    min: -1000,
                    max: 1000,
                    step: 0.01
                };
                defaultValue = 0;
                break;
            case "mat4":
                config = {
                    type: 'transform',
                    generator: 'transform',
                    mixer: {
                        fn: 'mixHash',
                        params: ['mixNumber']
                    }
                };
                defaultValue = {
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0
                };
                break;
            }

            if (!config)
                return false;
            
            if (this.filter.original.config.hasOwnProperty(uniform.name)
                && this.filter.original.config[uniform.name].type == config.type)
                return false;

            this.filter.original.config[uniform.name] = config;
            this.filter.original.params[uniform.name] = defaultValue;
            return true;
        },

        updateFilterConfig: function() {
            this.configEditor.setValue(JSON.stringify(this.filter.original, null, 4));
            this.filter.reload(this.filter.original);
            this.filterList.forkConfigUpdate(this.filter);
        },

        reload: function() {
            if (!this.filter)
                return;
            var configValue = this.configEditor.getValue(),
                configJSONValue = null;
            try {
                configJSONValue = JSON.parse(configValue);
            } catch (e) {
                return;
            }
            this.filter.reload(configJSONValue);
            this.filterList.forkConfigUpdate(this.filter);
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
        },

        onReloadButtonClicked: function() {
        	this.reload();
        },

        onSaveAnonymousGistClicked: function() {
            if (!this.filter)
                return;
            this.saveAnonymousGistEl.attr("disabled", "disabled");
            var filter = this.filter,
                data = filter.getData(),
                self = this,
                filterConfig = filter.original,
                name = filterConfig.label || filter.name || "Filter",
                files = {
                    "config.json": {
                        "content": JSON.stringify(filterConfig, null, 4)
                    },
                    "shader.vs": {
                        content: filter.editedSource_vertex
                    },
                    "shader.fs": {
                        content: filter.editedSource_fragment
                    }
                };
            // anonymous gists cannot be patched
            this.github.postGist(null, name, files, function(response) {
                self.saveAnonymousGistEl.removeAttr("disabled");
                data.gist_id = response.id;
                data.gist_html_url = response.html_url;
                self.filterList.forkConfigUpdate(filter);
                self.githubLinkEl.attr("href", response.html_url);
                self.githubPopupEl.show();
            });
        },

        onCloseGistPopupClicked: function() {
            this.githubPopupEl.hide();
        }

	}	

	Global.ShaderEditorView = ShaderEditorView;
})()