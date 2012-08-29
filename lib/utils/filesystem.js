(function(){
	function FileSystem() {
		this.queue = [];
		this.initialRequestSize = 1024 * 1024; // 1MB
		this.init();
	}

	FileSystem.prototype = {
		init: function() {
			if (!window.webkitStorageInfo || !window.webkitRequestFileSystem) {
				this.useFallbackStorage();
				return;
			}
			var self = this;
			window.webkitStorageInfo.requestQuota(PERSISTENT, this.initialRequestSize, 
				function(grantedBytes) {
					if (!grantedBytes) {
						self.useFallbackStorage();
						return;
					}
					window.webkitRequestFileSystem(PERSISTENT, grantedBytes, 
						self.onFileSystemCreated.bind(self),
						self.useFallbackStorage.bind(self)
					);
				},
				this.useFallbackStorage.bind(this)
			);
		},

		useFallbackStorage: function(e) {
			console.log("fallback", e);
			this.fileSystem = new Global.LocalStorage();
			this.drainQueue(this.fileSystem);
		},

		onFileSystemCreated: function(fileSystem) {
			this.fileSystem = fileSystem;
			this.drainQueue(this);
		},

		drainQueue: function(fileSystem) {
			var queue = this.queue;
			this.queue = null;
			$.each(queue, function(i, callback) {
				callback(fileSystem);
			});
		},

		register: function(callback) {
			if (this.fileSystem) {
				callback(this.fileSystem);
				return;
			}
			this.queue.push(callback);
		},

		get: function(path, callback) {
			var self = this;
			this.getEntry(path, 
				function(err, entry) {
					if (err) {
						callback(err);
						return;
					}
					if (!entry.isFile) {
						callback("Path is not a file!", null);
						return;
					}
					self.readFile(entry, callback);
				});
		},

		getEntry: function(path, callback){
			this.fileSystem.root.getFile(path, null, 
				function(entry) {
					callback(null, entry);
				}, callback);
		},

		readFile: function(entry, callback) {
			entry.file(function(file) {
				var reader = new FileReader();
				reader.onload = function() {
					callback(null, reader.result);
				};
				reader.onerror = function(e) {
					callback(e, null);
				}
				reader.readAsText(file, "UTF-8");
			}, callback);
		},

		save: function(path, data, callback) {
			this.fileSystem.root.getFile(path, { create: true }, 
				function(entry) {
					if (!entry.isFile) {
						callback("Path is not a file!", null);
						return;
					}
					entry.createWriter(function(writer) {
						var blob = new Blob([data]);
						writer.onwriteend = function() {
							writer.onwriteend = null;
							writer.write(blob);
							callback(null, entry);
						};
						writer.truncate(0);
					}, callback);
				}, callback);
		},

		list: function(path, callback) {
			this.fileSystem.root.getDirectory(path, { create: true },
				function(dirEntry) {
					var reader = dirEntry.createReader();
					reader.readEntries(function(list) {
						callback(null, list);
					}, callback);
				}, callback);
		},

		createDirectory: function(path, callback) {
			this.fileSystem.root.getDirectory(path, { create: true }, function(dirEntry) {
				callback(null, dirEntry);
			}, callback);
		},

		deleteFile: function(path, callback) {
			this.fileSystem.root.getFile(path, null, 
				function(entry) {
					entry.remove(function() {
						callback(null);
					}, callback);
				}, callback);
		}
	};

	Global.FileSystem = FileSystem;
})();