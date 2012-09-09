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