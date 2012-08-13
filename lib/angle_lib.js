(function() {
	
	// The following function will run in the worker thread.
	function WorkerInit() {
		Module['print'] = function(str) {
			postMessage({type: "error", value: str});
		}

		var cwrap = Module['cwrap'];

		var ShInitialize = cwrap("ShInitialize");
		var ShInitBuiltInResources = cwrap("ShInitBuiltInResources", "void", ["number"]);
		var ShConstructCompiler = cwrap("ShConstructCompiler", "number", ["number", "number", "number", "number"]);
		var ShCompile = cwrap("ShCompile", "number", ["number", "number", "number", "number"]);
		var ShFinalize = cwrap("ShFinalize", "number");
		var ShGetInfo = cwrap("ShGetInfo", "void", ["number", "number", "number"]);
		var ShGetObjectCode = cwrap("ShGetObjectCode", "void", ["number", "number"]);
		var ShGetInfoLog = cwrap("ShGetInfoLog", "void", ["number", "number"]);
		var Free = cwrap("free", "void", ["number"]);

		var SH_VERTEX_SHADER = 0x8B31;
		var SH_FRAGMENT_SHADER = 0x8B30;
		var SH_WEBGL_SPEC = 0x8B41;
		var SH_CSS_SHADERS_SPEC = 0x8B42
		var SH_ESSL_OUTPUT = 0x8B45;
		var SH_OBJECT_CODE = 0x0004;
		var SH_INFO_LOG_LENGTH = 0x8B84;
		var SH_OBJECT_CODE_LENGTH = 0x8B88;
		var SH_INTERMEDIATE_TREE = 0x0002;
		var SH_JS_OUTPUT = 0x8B48;

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
			var compileResult = ShCompile(compiler, strings, 1, SH_OBJECT_CODE);
			
			var result = {
				original: shaderString,
				compileResult: compileResult
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
		this.lastCallbackId = 0;
		this.callbacks = {};
		this.queue = [];
	}

	AngleLib.prototype = {
		angleJS: "lib/angle.closure.js",

		load: function() {
			if (this.loadStarted) 
				return;
			this.loadStarted = true;
			var self = this;
			$.get(this.angleJS, function(src) {
				var blob = new Blob([src, "\n", WorkerInit.toString(), "\nWorkerInit();"]);
				self.worker = new Worker(webkitURL.createObjectURL(blob));
				self.worker.onmessage = function(ev) {
					self.onWorkerMessage(ev);
				}
				// Start the worker.
				self.worker.postMessage("");
			});
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

		onWorkerResult: function(data) {
			var callback = this._getCallback(data.callback);
			if (!callback)
				return;
			callback(null, data.result);
		},

		onWorkerLoaded: function(data) {
			this.loaded = true;
			var queue = this.queue,
				self = this;
			this.queue = null;
			$.each(queue, function(i, item) {
				self.compile(item.type, item.source, item.callback);
			});
		},

		onWorkerError: function(data) {
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
	};

	Global.AngleLib = AngleLib;

})();