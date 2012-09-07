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

	function FileEntry(storage, path, name) {
		this.storage = storage;
		this.path = path;
		this.name = name;
	}

	FileEntry.prototype = {
		toURL: function(value) {
			return "data:text/plain;base64," + Global.Utils.encodeBase64(value || "");
		}
	}
	
	function LocalStorage() {
		this.storage = window.localStorage;
		this.files = this.readFileSystem();
	}

	LocalStorage.prototype = {
		descriptor: "filesystem",

		register: function(callback) {
			callback(this);
		},

		saveFileSystem: function() {
			this.storage.setItem(this.descriptor, JSON.stringify(this.files));
		},

		readFileSystem: function() {
			var fileSystem = this.storage.getItem(this.descriptor);
			if (!fileSystem)
				return {
					root: {},
					filesCount: 0
				};
			return JSON.parse(fileSystem);
		},

		getDirectoryEntry: function(path, create) {
			var entry = this.files.root;
			for (var i = 0; i < path.length; ++i) {
				var folderName = path[i];
				if (entry.hasOwnProperty(folderName)) {
					entry = entry[folderName];
					continue;
				}
				if (!create)
					return null;
				entry = entry[folderName] = {};
			}
			return entry;
		},

		splitPath: function(path) {
			return path.split("/");
		},

		saveFileEntry: function(entry, value) {
			var filePath = entry.path,
				fileName = entry.name,
				dirEntry = this.getDirectoryEntry(filePath, true);
			var key = dirEntry[fileName];
			if (!key) {
				var fileId = "file" + (++this.files.filesCount);
				key = dirEntry[fileName] = {
					fileId: fileId,
					name: fileName
				};
				this.saveFileSystem();
			}
			this.storage.setItem(key.fileId, value);
		},

		removeFileEntry: function(entry, value) {
			var filePath = entry.path,
				fileName = entry.name,
				dirEntry = this.getDirectoryEntry(filePath, true);
			var key = dirEntry[fileName];
			if (!key)
				return;
			delete dirEntry[fileName];
			this.saveFileSystem();
			this.storage.removeItem(key);
		},

		loadFileEntry: function(entry) {
			var filePath = entry.path,
				fileName = entry.name,
				dirEntry = this.getDirectoryEntry(filePath, false);
			if (!dirEntry)
				return null;
			var key = dirEntry[fileName];
			if (!key)
				return null;
			return this.storage.getItem(key.fileId);
		},

		get: function(path, callback) {
			var self = this;
			this.getEntry(path, 
				function(err, entry) {
					if (err) {
						callback(err);
						return;
					}
					self.readFile(entry, callback);
				});
		},

		getEntry: function(path, callback) {
			var filePath = this.splitPath(path),
				fileName = filePath.pop();
			callback(null, new FileEntry(this, filePath, fileName));
		},

		readFile: function(entry, callback) {
			callback(null, this.loadFileEntry(entry));
		},

		save: function(path, data, callback) {
			var self = this;
			this.getEntry(path, function(err, entry) {
				self.saveFileEntry(entry, data);
				if (callback)
					callback(null, entry);
			});
		},

		list: function(path, callback) {
			var filePath = this.splitPath(path),
				dirEntry = this.getDirectoryEntry(filePath, true),
				list = [],
				self = this;
			$.each(dirEntry, function(i, entry) {
				list.push(new FileEntry(self, filePath, entry.name));
			});
			callback(null, list);
		},

		createDirectory: function(path, callback) {
			var filePath = this.splitPath(path),
				dirEntry = this.getDirectoryEntry(filePath, true);
			callback(null, path);
		},

		deleteFile: function(path, callback) {
			var self = this;
			this.getEntry(path, function(err, entry) {
				self.removeFileEntry(entry);
				callback(null);
			});
		}
	}

	Global.LocalStorage = LocalStorage;
})();