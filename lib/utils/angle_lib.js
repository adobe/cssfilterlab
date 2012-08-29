(function() {
	
	// The following function will run in the worker thread.
	function WorkerInit() {
		Module['print'] = function(str) {
			postMessage({type: "error", value: str});
		}

		var cwrap = Module['cwrap'];

		var Free = cwrap("free", "void", ["number"]);
		var ShCompile = cwrap("ShCompile", "number", ["number", "number", "number", "number"]);
		var ShConstructCompiler = cwrap("ShConstructCompiler", "number", ["number", "number", "number", "number"]);
		var ShFinalize = cwrap("ShFinalize", "number");
		var ShGetActiveUniform = cwrap("ShGetActiveUniform", "void", ["number", "number", "number", "number", "number", "number", "number"]);
		var ShGetInfo = cwrap("ShGetInfo", "void", ["number", "number", "number"]);
		var ShGetInfoLog = cwrap("ShGetInfoLog", "void", ["number", "number"]);
		var ShGetObjectCode = cwrap("ShGetObjectCode", "void", ["number", "number"]);
		var ShInitBuiltInResources = cwrap("ShInitBuiltInResources", "void", ["number"]);
		var ShInitialize = cwrap("ShInitialize");

		var SH_ACTIVE_UNIFORM_MAX_LENGTH = 0x8B87;
		var SH_ACTIVE_UNIFORMS = 0x8B86;
		var SH_ATTRIBUTES_UNIFORMS = 0x0008;
		var SH_CSS_SHADERS_SPEC = 0x8B42
		var SH_ESSL_OUTPUT = 0x8B45;
		var SH_FRAGMENT_SHADER = 0x8B30;
		var SH_INFO_LOG_LENGTH = 0x8B84;
		var SH_INTERMEDIATE_TREE = 0x0002;
		var SH_JS_OUTPUT = 0x8B48;
		var SH_OBJECT_CODE = 0x0004;
		var SH_OBJECT_CODE_LENGTH = 0x8B88;
		var SH_VERTEX_SHADER = 0x8B31;
		var SH_WEBGL_SPEC = 0x8B41;

		var types = {
			0: "none",
  			
  			0x1406: "float",
  			0x8B50: "vec2",
  			0x8B51: "vec3",
  			0x8B52: "vec4",
			
			0x1404: "int",
  			0x8B53: "ivec2",
  			0x8B54: "ivec3",
  			0x8B55: "ivec4",

  			0x8B56: "bool",
  			0x8B57: "bool2",
  			0x8B58: "bool3",
  			0x8B59: "bool4",

  			0x8B5A: "mat2",
  			0x8B5B: "mat3",
  			0x8B5C: "mat4",

  			0x8B5E: "sampler2d",
  			// 0x8B60: "sampler3d"

  			// 0x8B63: "sampler2d_rect",
  			// 0x8D66: "sampler2d_external"
  		};

		ShInitialize();
		var builtinResources = allocate(100 * 4, 'i8'); // big enough to cover for the size of ShBuiltInResources
		ShInitBuiltInResources(builtinResources);

		var compilers = {
			"vertex": ShConstructCompiler(SH_VERTEX_SHADER, SH_CSS_SHADERS_SPEC, SH_JS_OUTPUT, builtinResources),
			"fragment": ShConstructCompiler(SH_FRAGMENT_SHADER, SH_CSS_SHADERS_SPEC, SH_JS_OUTPUT, builtinResources)
		};

		function compile(type, shaderString) {
			var stack = Runtime.stackSave();
			var compiler = compilers[type];

			var shaderStringPtr = allocate(intArrayFromString(shaderString), 'i8', ALLOC_STACK);
			var strings = allocate(4, 'i32', ALLOC_STACK);
			setValue(strings, shaderStringPtr, 'i32');
			var compileResult = ShCompile(compiler, strings, 1, SH_OBJECT_CODE | SH_ATTRIBUTES_UNIFORMS);
			
			var result = {
				original: shaderString,
				compileResult: compileResult,
				uniforms: []
			};

			ShGetInfo(compiler, SH_OBJECT_CODE_LENGTH, strings);
			var length = getValue(strings, 'i32');
			var shaderResultStringPtr = allocate(length, 'i8', ALLOC_STACK);
			ShGetObjectCode(compiler, shaderResultStringPtr);
			result.source = length > 1 ? Pointer_stringify(shaderResultStringPtr, length - 1) : "";
			
			ShGetInfo(compiler, SH_INFO_LOG_LENGTH, strings);
			var length = getValue(strings, 'i32');
			var shaderResultStringPtr = allocate(length, 'i8', ALLOC_STACK);
			ShGetInfoLog(compiler, shaderResultStringPtr);
			result.info = length > 1 ? Pointer_stringify(shaderResultStringPtr, length - 1) : "";

			ShGetInfo(compiler, SH_ACTIVE_UNIFORMS, strings);
			var uniformsCount = getValue(strings, 'i32');
			
			ShGetInfo(compiler, SH_ACTIVE_UNIFORM_MAX_LENGTH, strings);
			var maxUnfiromNameLength = getValue(strings, 'i32');
			var uniformName = allocate(maxUnfiromNameLength, 'i8', ALLOC_STACK);
			for (var i = 0; i < uniformsCount; ++i) {
				ShGetActiveUniform(compiler, i, strings, strings + 4, strings + 8, uniformName, 0);
				var uniformNameLength = getValue(strings, 'i32');
				var type = getValue(strings + 8, 'i32');
				if (!types.hasOwnProperty(type))
					continue;
				result.uniforms.push({
					size: getValue(strings + 4, 'i32'),
					type: types[type],
					name: Pointer_stringify(uniformName, uniformNameLength)
				});
			}

			Runtime.stackRestore(stack);
			return result;
		}

		this.onmessage = function(event) {
			switch (event.data.type) {
				case "compile":
					try {
						var result = compile(event.data.shaderType, event.data.source);
						postMessage({
							type: "result",
							result: result,
							callback: event.data.callback
						});
					} catch (e) {
					 	postMessage({
					 		type: "error", 
					 		error: e ? e.toString() : "Undefined error",
					 		callback: event.data.callback
					 	});
					}
				break;
			}
		}
		postMessage({type: 'loaded'});
	}

	function AngleLib() {
		AngleLib.super.call(this);
		this.lastCallbackId = 0;
		this.callbacks = {};
		this.queue = [];
	}

	Global.Utils.extend(AngleLib).from(Global.EventDispatcher);

	$.extend(AngleLib.prototype, {
		angleJS: "lib/third_party/angle.closure.js",

		load: function() {
			if (this.loadStarted) 
				return;
			this.loadStarted = true;
			var self = this;
			var xhr = new XMLHttpRequest();
			xhr.onprogress = function(ev) {
				console.log(ev);
				self.fire("progress", [ev.loaded / ev.total]);
			}
			xhr.onreadystatechange = function(ev) {
				if (xhr.readyState != 4 || xhr.status != 200)
					return;
				var blob = new Blob([xhr.response, "\n", WorkerInit.toString(), "\nWorkerInit();"]);
				self.worker = new Worker(webkitURL.createObjectURL(blob));
				self.worker.onmessage = function(ev) {
					self.onWorkerMessage(ev);
				}
				// Start the worker.
				self.worker.postMessage("");
				self.fire("completed");
			};
			xhr.open("GET", this.angleJS);
			xhr.send();
		},

		onWorkerMessage: function(ev) {
			switch (ev.data.type) {
				case 'result':
					this.onWorkerResult(ev.data);
					break;
				case 'loaded':
					this.onWorkerLoaded();
					break;
				case 'error':
					this.onWorkerError(ev.data);
					break;
			}
		},

		parseErrors: function(errorsString) {
			var errors = [],
				match,
				parser = /^(\w*):\s(\d*):(.*)/gm;
			while((match = parser.exec(errorsString)) !== null) {
				errors.push({
					type: match[1],
					index: parseInt(match[2]),
					error: match[3]
				});
			}
			return errors;
		},

		onWorkerResult: function(data) {
			var callback = this._getCallback(data.callback);
			if (!callback)
				return;
			var result = data.result;
			if (result.info && result.info.length)
				result.errors = this.parseErrors(result.info);
			callback(null, result);
		},

		onWorkerLoaded: function(data) {
			this.loaded = true;
			var queue = this.queue,
				self = this;
			this.queue = null;
			$.each(queue, function(i, item) {
				self.compile(item.shaderType, item.source, item.callback);
			});
		},

		onWorkerError: function(data) {
			console.log(data);
			var callback = this._getCallback(data.callback);
			if (!callback)
				return;
			callback(data.error);
		},

		_registerCallback: function(callback) {
			var id = ++this.lastCallbackId;
			this.callbacks[id] = callback;
			return id;
		},

		_getCallback: function(id) {
			var callback = this.callbacks[id];
			delete this.callbacks[id];
			return callback;
		},

		compile: function(type, source, callback) {
			if (!this.loaded) {
				this.queue.push({
					shaderType: type,
					source: source,
					callback: callback
				});
				if (!this.loadStarted)
					this.load();
				return;
			}
			this.worker.postMessage({
				type: "compile", 
				shaderType: type,
				source: source, 
				callback: this._registerCallback(callback)
			});
		}
	});

	Global.AngleLib = AngleLib;

})();