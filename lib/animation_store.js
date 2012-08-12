(function(){
	
	function AnimationStore(animation) {
		this.animation = animation;
		animation.store = this;
		this.animationsContainerEl = $("#animations-container");
		this.animationsEl = $("#animations");
		this.saveAsEl = $("#save-animation");
		this.deleteEl = $("#delete-animation");
		this.initialRequestSize = 1024 * 1024; // 1MB
		this.currentAnimation = null;
		this.animationsByName = {};
		this.init();
	}

	AnimationStore.prototype = {
		defaultAnimationName: "Default",
		animationsFolder: "animations",

		animationFileName: function(animation) {
			return this.animationsFolder + "/" + encodeURIComponent(animation);
		},

		decodeAnimationName: function(fileName) {
			return decodeURIComponent(fileName);
		},

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
			this.saveAsEl.click(function() {
				self.saveAnimationAs();
			});
			this.deleteEl.click(function() {
				self.deleteAnimation();
			})
		},

		onFileSystemCreated: function(fileSystem) {
			var self = this;
			
			this.animationsContainerEl.show();
			this.fileSystem = fileSystem;
			self.loadAnimations();
			
			window.addEventListener("hashchange", function() {
				var animation = self.getAnimationFromHash();
		        if (!animation || animation == self.currentAnimation)
		        	return;
		        self.loadAnimation(animation);
		    });
		},

		getAnimationFromHash: function() {
			var animation = window.location.hash;
		    if (animation.length <= 1)
		    	return null;
		    return decodeURIComponent(animation.substr(1));
	    },

		loadAnimations: function() {
			var self = this;
			this.fileSystem.root.getDirectory(this.animationsFolder, { create:true },
				function(animationsDirectoryEntry) {
					var reader = animationsDirectoryEntry.createReader();
					reader.readEntries(function(list) {
						self.animationsEl.empty();
						$.each(list, function(i, entry) {
							if (!entry.isFile)
								return;
							self.addAnimation(self.decodeAnimationName(entry.name));
						});
						self.loadAnimation(self.getAnimationFromHash() || self.defaultAnimationName);
					});
				});
		},

		getAnimationByName: function(name) {
			return this.animationsByName["_" + name];
		},

		addAnimation: function(path) {
			var el = this.getAnimationByName(path);
			if (el)
				return el;
			var self = this;
			el = $("<li />")
				.text(path)
				.click(function() {
					self.loadAnimation(path);
				})
				.appendTo(this.animationsEl);
			this.animationsByName["_" + path] = el;
			if (this.currentAnimation == path)
				el.addClass("current");
			return el;
		},

		getAnimationElementByName: function(path) {
			return this.animationsByName["_" + path];
		},

		setActiveAnimation: function(animation) {
			if (this.currentAnimation == animation)
				return;
			var eldEl = this.getAnimationElementByName(this.currentAnimation),
				el = this.getAnimationElementByName(animation);
			if (eldEl) eldEl.removeClass("current");
			if (!el)
				el = this.addAnimation(animation);
			el.addClass("current");
			this.currentAnimation = animation;
			this.updateHash();
		},

		updateHash: function() {
			var animation = this.currentAnimation;
			if (animation == this.defaultAnimationName) {
				if (window.location.hash && window.location.hash.length)
					window.location.hash = "";
				return;
			}
			lastHash = encodeURIComponent(animation);
	        window.location.hash = lastHash;
		},

		loadAnimation: function(animation) {
			this.setActiveAnimation(animation);
			if (!this.fileSystem)
				return;
			var self = this;
			this.fileSystem.root.getFile(this.animationFileName(animation), null, 
				function(entry) {
					if (!entry.isFile)
						return;
					entry.file(function(file) {
						var reader = new FileReader();
						reader.onload = function() {
							if (animation != self.currentAnimation) {
								// If the animation changed since we loaded it last time,
								// avoid overwritting with some old values.
								return;
							}
							var parsedAnimation = null;
							try {
								parsedAnimation = JSON.parse(reader.result);
							} catch (e) {
								console.error("Error while parsing stored animation", reader.result, e);
							}
							if (!parsedAnimation)
								return;
							self.animation.loadAnimation(parsedAnimation);
						};
						reader.readAsText(file, "UTF-8");
					});
				},
				function(e) {
					if (animation == self.defaultAnimationName) {
						// File doesn't exist yet.
						self.saveAnimation();
					}
				});
		},

		saveAnimation: function() {
			if (!this.fileSystem)
				return;
			var self = this,
				data = this.animation.dumpAnimation(),
				animation = this.currentAnimation;
			this.fileSystem.root.getFile(this.animationFileName(animation), { create: true }, 
				function(entry) {
					if (!entry.isFile)
						return;
					entry.createWriter(function(writer) {
						var blob = new Blob([JSON.stringify(data)]);
						writer.onwriteend = function() {
							writer.onwriteend = null;
							writer.write(blob);	
						};
						writer.truncate(0);
					});
				});
		},

		saveAnimationAs: function() {
			var newName = prompt("New animation name:");
			if (!newName)
				return;
			this.setActiveAnimation(newName);
			this.saveAnimation();
		},

		deleteAnimation: function() {
			var animation = this.currentAnimation;
			if (animation == this.defaultAnimationName) {
				this.animation.loadEmptyAnimation();
				this.saveAnimation();
				return;
			}
			var self = this;
			this.loadAnimation(this.defaultAnimationName);
			this.fileSystem.root.getFile(this.animationFileName(animation), null, 
				function(entry) {
					entry.remove(function() {
						// Done.
						var removedEl = self.getAnimationByName(animation);
						removedEl.remove();
					});
				}
			);
			
		}
	};

	Global.AnimationStore = AnimationStore;

})();