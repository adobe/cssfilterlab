/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

(function() {
	function ShaderEditorView(filterList, github) {
		this.filterList = filterList;
        this.github = github;

        this.configEditorEl = $("#config-editor");
        this.shaderNameEl = this.configEditorEl.find(".config-shader-name");
        this.shaderMixBlendModeEl = this.configEditorEl.find(".config-shader-mix-blend-mode");
        this.shaderMeshColumnsEl = this.configEditorEl.find(".config-shader-mesh-columns");
        this.shaderMeshRowsEl = this.configEditorEl.find(".config-shader-mesh-rows");

		this.vertexShaderEditorEl = $("#vertex-shader .code-view");
		this.fragmentShaderEditorEl = $("#fragment-shader .code-view");

		this.errorsEl = $("#shader-errors");
		this.vertexShaderErrorsEl = $("#shader-errors .vertex-shader");
		this.fragmentShaderErrorsEl = $("#shader-errors .fragment-shader");

        this.saveAnonymousGistEl = $("#post-gist-button");
        this.saveAnonymousGistEl.click(this.onSaveAnonymousGistClicked.bind(this));   

        this.githubPopupEl = $("#github-popup");
        this.githubLinkEl = $("#gist-link");
        this.githubPopupCloseEl = $("#gist-popup-close");
        this.githubPopupCloseEl.click(this.onCloseGistPopupClicked.bind(this));   

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


		this.configDockPanel = new Global.DockPanel("Filter Configuration");
		$("#config-editor").appendTo(this.configDockPanel.el);

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
        this.filterModel = null;
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
				this.dockView
                    .addVerticalColumn()
                        .addCloseButton()
                        .setMinSize(400)
                        .setWidth(600)
                        .addContainer()
                            .add(this.configDockPanel)
                            .add(this.vertexDockPanel)
                            .add(this.fragmentDockPanel)
                    .column
                        .addContainer()
                            .setHeight(100)
                            .add(this.errorsDockPanel)
                    .column
                        .on("columnClosed", this.onColumnClosed.bind(this));

				$("body").bind("dockViewResized", this.onDockResizedCallback);
	            window.addEventListener("resize", this.onWindowResizedCallback, false);
			}
		},

		onColumnClosed: function() {
			$("body").unbind("dockViewResized", this.onDockResizedCallback);
			window.removeEventListener("resize", this.onWindowResizedCallback, false);
			this.panelsAdded = false;
		},

        updateModel: function(filterModel) {
            var self = this;

            this.filterModel = new Global.ActiveObject(filterModel);
            
            this.filterModel.bind("label", function(value) {
                self.configDockPanel.container.column.setTitle("Editing shader: " + value);
            });

            this.filterModel
                .bindToTextInput("label", this.shaderNameEl);

            var mix = this.filterModel.get("mix");
            if (!mix)
                mix = this.filterModel.set("mix", {"blendMode": "normal"});
            mix.bindToSelectInput("blendMode", this.shaderMixBlendModeEl);
            
            var mesh = this.filterModel.get("mesh");
            if (!mesh)
                mesh = this.filterModel.set("mesh", {"columns": 1, "rows": 1});
            mesh.bindToSelectInput("columns", this.shaderMeshColumnsEl)
                .bindToSelectInput("rows", this.shaderMeshRowsEl);
            
            this.filterModel.on("rootValueChanged", this.reload.bind(this));
        },

		loadFilter: function(filter) {
            // Prevent change events while loading first version.
            this.filter = null;

            this.show();

            this.filter = filter;
			this.updateModel(filter.original);
			
			this.vertexShaderEditor.setValue(filter.editedSource_vertex || "");
			this.fragmentShaderEditor.setValue(filter.editedSource_fragment || "");
			
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
            this.updateModel(this.filter.original);
            this.filter.reload(this.filter.original);
            this.filterList.forkConfigUpdate(this.filter);
        },

        reload: function() {
            if (!this.filter || !this.filterModel)
                return;
            var jsonFilterModel = this.filterModel.toJSON();
            this.filter.reload(jsonFilterModel);
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