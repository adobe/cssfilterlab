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
	function ShaderEditorView(filterList, github) {
		this.filterList = filterList;
        this.github = github;

        this.configEditorEl = $("#config-editor");
        this.shaderNameEl = this.configEditorEl.find(".config-shader-name");
        this.shaderMixBlendModeEl = this.configEditorEl.find(".config-shader-mix-blend-mode");
        this.shaderMeshColumnsEl = this.configEditorEl.find(".config-shader-mesh-columns");
        this.shaderMeshRowsEl = this.configEditorEl.find(".config-shader-mesh-rows");
        this.configParametersEl = this.configEditorEl.find(".config-parameters");
        this.configParametersWrapperEl = this.configEditorEl.find(".config-parameters-wrapper");
        this.configParameterEl = this.configEditorEl.find(".config-parameter").detach();

		this.vertexShaderEditorEl = $("#vertex-shader .code-view");
		this.fragmentShaderEditorEl = $("#fragment-shader .code-view");

		this.errorsEl = $("#shader-errors");
		this.vertexShaderErrorsEl = $("#shader-errors .vertex-shader");
		this.fragmentShaderErrorsEl = $("#shader-errors .fragment-shader");

		// error for missing CodeMirror lib
		this.codeViewErrorEl = $("#code-view-error");

        this.saveToGistEl = $("#post-gist-button");
        this.saveToGistEl.click(this.onSaveToGistClicked.bind(this));   

        this.githubPopupEl = $("#github-popup");
        this.githubLinkEl = $("#gist-link");
        this.githubIframeEl = $("#github-login");
        this.githubPopupCloseEl = this.githubPopupEl.find(".gist-popup-close");
        this.githubPopupCloseEl.click(this.onCloseGistPopupClicked.bind(this));   
        this.githubSaveGistWithLoginEL = $("#save-gist-with-login");
        this.githubSaveGistWithLoginEL.click(this.onSaveGistWithLoginClicked.bind(this));
        this.githubLoginLinkEl = $("#github-login-link");
        this.githubLoginLinkEl.click(this.onGithubLoginLinkClicked.bind(this));
        this.githubSaveAnonymousGistEl = $("#save-anonymous-gist");
        this.githubSaveAnonymousGistEl.click(this.onSaveAnonymousGistClicked.bind(this));   

		this.loaderView = new Global.LoadingProgressView($("#shader-errors .loader"));
		this.angleLib = new Global.AngleLib();
		this.angleLib.on("progress", this.onAngleLibLoadingProgress.bind(this));
		this.angleLib.on("completed", this.onAngleLibLoadingCompleted.bind(this));

		this.vertexShaderEditor = new Global.ShaderCodeEditorView(this.angleLib, "vertex",
				this.vertexShaderEditorEl, this.vertexShaderErrorsEl);

		this.fragmentShaderEditor = new Global.ShaderCodeEditorView(this.angleLib, "fragment",
				this.fragmentShaderEditorEl, this.fragmentShaderErrorsEl);
		
        // Use the timer to avoid updating the shader after each keystroke.
        this.shaderTextChangeTimers = {
            "vertex": new Global.Timer(300),
            "fragment": new Global.Timer(300)
        };
        this.shaderTextChangeTimers["vertex"].on("timerFired", this.onShaderTextChangedTimerFired.bind(this, "vertex"));
        this.shaderTextChangeTimers["fragment"].on("timerFired", this.onShaderTextChangedTimerFired.bind(this, "fragment"));

        this.shaderConfigChangeTimer = new Global.Timer(300);
        this.shaderConfigChangeTimer.on("timerFired", this._filterModelChanged.bind(this));

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
				
				this.editorColumn = this.dockView.addVerticalColumn()

                this.editorColumn.addCloseButton()
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
                            .on("columnClosed", this.onColumnClosed.bind(this))
                                                                               
                // move the github save button in the tablist
                this.editorColumn.items[0].tabListEl.append(this.saveToGistEl);
                
                $("body").bind("dockViewResized", this.onDockResizedCallback);
	            window.addEventListener("resize", this.onWindowResizedCallback, false);
			}
		},
		
		hide: function(){
		    this.editorColumn.onColumnCloseButtonClicked()
		},
		
		onColumnClosed: function() {
			$("body").unbind("columnResized", this.onDockResizedCallback);
			window.removeEventListener("resize", this.onWindowResizedCallback, false);
			this.panelsAdded = false;
            this.configDockPanel.setActive(false);
            this.vertexDockPanel.setActive(false);
            this.fragmentDockPanel.setActive(false);
		},

        updateModel: function(filterModel) {
            var self = this;

            this.configEditorEl.find(".config-parameter").remove();

            this.filterModel = new Global.ActiveObject(filterModel);

            this.updateTitle();
            
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

            var params = this.filterModel.get("params");
            self.configParametersEl.empty();

            var paramsByKey = {};
            var first = true;
            $.each(params.properties, function(key, value) {
                var item = self.createParameterItem(key, first);
                paramsByKey["_" + key] = item;
                first = false;
            });
            params.on("propertyAdded", function(key, value) {
                var item = self.createParameterItem(key);
                paramsByKey["_" + key] = item;
            });
            params.on("propertyRemoved", function(key) {
                var item = paramsByKey["_" + key];
                delete paramsByKey["_" + key];
                if (!item)
                    return;
                if (self._activeParameter == key)
                    self.configEditorEl.find(".config-parameter").remove();
                item.remove();
            });
            
            this.filterModel.on("rootValueChanged", this.filterModelChanged.bind(this));
        },

        createParameterItem: function(key, first) {
            var el = $("<li />")
                .text(key)
                .appendTo(this.configParametersEl);
            el.click(this.onParamterItemClicked.bind(this, el, key));
            if (first)
                this.activateParameter(el, key);
            return el;
        },

        onParamterItemClicked: function(el, key) {
            this.activateParameter(el, key);
            return false;
        },

        activateParameter: function(parameterEl, key) {
            var values = this.filterModel.get("params"),
                config = this.filterModel.get("config"),
                self = this;
            this._activeParameter = key;

            this.configParametersEl.find("li").removeClass("active");
            parameterEl.addClass("active");

            config.bind(key, function(paramConfig) {
                // Param config can be null when the value is deleted
                if (!paramConfig)
                    return;
                var el = self.configParameterEl.clone();
                self.configEditorEl.find(".config-parameter").remove();
                self.configParametersWrapperEl.after(el);
                el.find(".config-parameter-label").text(key);
                el.find(".config-parameter-delete").click(function() {
                    config.remove(key);
                    values.remove(key);
                    return false;
                });
                
                paramConfig.bindToSelectInput("type", el.find(".config-parameter-type"));
                paramConfig.bind("type", function(type, oldValue) {
                    if (!oldValue || type == oldValue)
                        return;
                    var valueType = self.parametersByType[type];
                    if (!valueType)
                        return;
                    values.set(key, valueType.value);
                    config.set(key, valueType.config);
                });

                if (paramConfig.get("type") == "warp" && !values.get(key))
                    values.set(key, Global.WarpHelpers.generateWarpPoints());
                
                var defaultValueEl = el.find(".config-default-value");
                defaultValueEl.empty();

                var editorClass = Global.Controls.get(paramConfig.get("type"));
                if (!editorClass)
                    return;

                var editor = new editorClass(self, key, config.toJSON()),
                    table = $("<table class='paramsTable' />").appendTo(defaultValueEl),
                    tr = $("<tr class='field' />")
                        .appendTo(table);
                editor.pushControls(tr);
                editor.setSource(values);

                var configParameterRangeEl = el.find(".config-parameter-range");
                configParameterRangeEl.hide();
                if (self.rangeTypes.indexOf(paramConfig.get("type")) != -1) {
                    configParameterRangeEl.show();
                    paramConfig.bindToTextInput("min", configParameterRangeEl.find(".config-parameter-range-min"));
                    paramConfig.bindToTextInput("max", configParameterRangeEl.find(".config-parameter-range-max"));
                    paramConfig.bindToTextInput("step", configParameterRangeEl.find(".config-parameter-range-step"));
                    paramConfig.bind("min", editor.updateConfig.bind(editor, paramConfig));
                    paramConfig.bind("max", editor.updateConfig.bind(editor, paramConfig));
                    paramConfig.bind("step", editor.updateConfig.bind(editor, paramConfig));
                }
            });
        },

		loadFilter: function(filter) {
            // Prevent change events while loading first version.
            this.filter = null;

            this.show();

            this.filter = filter;
			this.updateModel(filter.original);

			// tripwire for missing CodeMirror library
            if (this.vertexShaderEditor.isSupported){
                this.vertexShaderEditor.setValue(filter.editedSource_vertex || "");
                this.fragmentShaderEditor.setValue(filter.editedSource_fragment || "");
            } else if (!this.haveAddedCodeMirrorError) {
                this.haveAddedCodeMirrorError = true;
                this.vertexShaderEditorEl.append(this.codeViewErrorEl.clone(true).show())
                this.fragmentShaderEditorEl.append(this.codeViewErrorEl.clone(true).show())
            }
			
			if (this.lastEditor)
				this.lastEditor.refresh();
		},

        onShaderTextChanged: function(type, newValue) {
            if (!this.filter)
                return;
            this.shaderTextChangeTimers[type].invoke([this.filter, newValue]);
        },

        onShaderTextChangedTimerFired: function(type, filter, newValue) {
            this.filterList.filterUpdate(filter, type, newValue);
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

        rangeTypes: ["range", "vec2", "vec3", "vec4"],

        parametersByType: {
            "color": {
                config: {
                    type: 'color',
                    mixer: 'mixVector',
                    generator: 'vector'
                },
                value: [0, 0, 0, 1]
            },
            "unknown": {
                config: {
                    type: 'unknown'
                },
                value: "0"
            },
            "checkbox": {
                config: {
                    type: 'checkbox',
                    mixer: 'dontMix'
                },
                value: 0
            },
            "range": {
                config: {
                    type: 'range',
                    min: -1000,
                    max: 1000,
                    step: 0.01
                },
                value: 0
            },

            "vec2": {
                config: {
                    type: 'vec2',
                    generator: 'vector',
                    mixer: 'mixVector',
                    min: -1000,
                    max: 1000,
                    step: 0.01
                },
                value: [0, 0]
            },

            "vec3": {
                config: {
                    type: 'vec3',
                    generator: 'vector',
                    mixer: 'mixVector',
                    min: -1000,
                    max: 1000,
                    step: 0.01
                },
                value: [0, 0, 0]
            },

            "vec4": {
                config: {
                    type: 'vec4',
                    generator: 'vector',
                    mixer: 'mixVector',
                    min: -1000,
                    max: 1000,
                    step: 0.01
                },
                value: [0, 0, 0, 0]
            },

            "transform": {
                config: {
                    type: 'transform',
                    generator: 'transform',
                    mixer: {
                        fn: 'mixHash',
                        params: ['mixNumber']
                    }
                },
                value: {
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0
                }
            },

            "warp": {
                config: {
                    type: 'warp',
                    generator: 'warpArray',
                    mixer: 'mixVectorOfVectors'
                },
                value: null
            }
        },

        isSameType: function(oldType, newType) {
            if (oldType == newType
                || (oldType == "color" && newType == "vec4")
                || (oldType == "checkbox" && newType == "range")
                || newType == "unknown"
                || oldType == "unknown")
                return true;

            return false;
        },

        addUniform: function(uniform) {
            var value;
            if (uniform.size != 1)
                return false;
            switch (uniform.type) {
            case "vec2":
                value = this.parametersByType["vec2"];
                break;
            case "vec3":
                value = this.parametersByType["vec3"];
                break;
            case "vec4":
                value = this.parametersByType["vec4"];
                break;
            case "float":
                value = this.parametersByType["range"];
                break;
            case "mat4":
                value = this.parametersByType["transform"];
                break;
            default:
                value = this.parametersByType["unknown"];
                break;
            }

            if (!value)
                return false;
            
            if (this.filter.original.config.hasOwnProperty(uniform.name)
                && this.isSameType(this.filter.original.config[uniform.name].type, value.config.type))
                return false;

            this.filter.original.config[uniform.name] = value.config;
            this.filter.original.params[uniform.name] = value.value;
            return true;
        },

        updateFilterConfig: function() {
            this.updateModel(this.filter.original);
            this.filter.reload(this.filter.original);
            this.filterList.forkConfigUpdate(this.filter);
        },

        filterModelChanged: function() {
            if (!this.filter || !this.filterModel)
                return;
            this.shaderConfigChangeTimer.invoke([]);
        },

        _filterModelChanged: function() {
            if (!this.filter || !this.filterModel)
                return;
            this.updateTitle();
            var jsonFilterModel = this.filterModel.toJSON();
            this.filter.reload(jsonFilterModel);
            this.filterList.forkConfigUpdate(this.filter);
        },

        updateTitle: function() {
            if (!this.filterModel)
                return;
            this.configDockPanel.container.column.setTitle("Editing shader: " + this.filterModel.label);
        },

		onWindowResized: function() {
			if (!this.lastEditor)
				return;
            this.lastEditor.refresh();
        },

        onDockResized: function(ev, direction) {
            if (!this.lastEditor)
                return; 
            this.lastEditor.refresh(); 
        },

        onActiveStateChanged: function(editor, active) {
        	if (active) {
                this.lastEditor = editor;
	        	this.lastEditor.setActive(true);
	        } else {
                editor.setActive(false);
            }
        },

        onSaveToGistClicked: function() {
            if (!this.filter)
                return false;
            this.githubPopupEl
                .removeClass("saved saving login")
                .addClass("info")
                .show();
            return false;
        },

        onSaveGistWithLoginClicked: function() {
            this.githubPopupEl
                .removeClass("saved saving info")
                .addClass("login")
                .show();
            this.onGithubLoginCallback = this.github.on("login", this.onGithubLogin.bind(this));
            this.openGithubLogin();
            return false;
        },

        openGithubLogin: function() {
            var loginUrl = this.github.getLoginUrl();
            window.open(loginUrl, "css_filterlab_github_login", "width=1015,height=500");
        },

        onGithubLoginLinkClicked: function() {
            this.openGithubLogin();
            return false;
        },

        onGithubLogin: function(err, token) {
            console.log(err, token);
            if (err) {
                this.githubPopupEl
                    .addClass("login-failed")
                    .show();
            } else {
                this.saveGist(token);
            }
        },

        onSaveAnonymousGistClicked: function() {
            this.saveGist(null);
            return false;
        },

        saveGist: function(token) {
            if (!this.filter)
                return;
            
            this.githubPopupEl
                .removeClass("info login")
                .addClass("saving");

            var filter = this.filter,
                data = filter.getData(),
                self = this,
                filterConfig = filter.original,
                name = filterConfig.label || filter.name || "Filter";
            filterConfig.createdWith = "CSS FilterLab";
            
            var files = {
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
            this.github.postGist(token, null, name, files, function(response) {
                data.gist_id = response.id;
                data.gist_html_url = response.html_url;
                self.filterList.forkConfigUpdate(filter);

                self.githubLinkEl.attr("href", response.html_url).text(response.html_url);
                self.githubPopupEl.removeClass("saving").addClass("saved");
            });
        },

        removeGithubCallback: function() {
            if (this.onGithubLoginCallback) {
                this.github.off("login", this.onGithubLoginCallback);
                this.onGithubLoginCallback = null;
            }
        },

        onCloseGistPopupClicked: function() {
            this.removeGithubCallback();
            this.githubPopupEl.hide();
            return false;
        }

	}	

	Global.ShaderEditorView = ShaderEditorView;
})()