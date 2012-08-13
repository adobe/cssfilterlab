(function(){
	function FileSystem() {
		this.queue = [];
		this.init();
	}

	FileSystem.prototype = {
		init: function() {
			if (!window.webkitStorageInfo || !window.webkitRequestFileSystem)
				return;
			var self = this;
			window.webkitStorageInfo.requestQuota(PERSISTENT, this.initialRequestSize, function(grantedBytes) {
				window.webkitRequestFileSystem(PERSISTENT, grantedBytes, 
					function(fileSystem) {
						self.onFileSystemCreated(fileSystem);
				});
			});
		},

		onFileSystemCreated: function(fileSystem) {
			this.fileSystem = fileSystem;
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
			this.fileSystem.root.getFile(path, null, 
				function(entry) {
					if (!entry.isFile) {
						callback("Path is not a file!", null);
						return;
					}
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
							callback(null);
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