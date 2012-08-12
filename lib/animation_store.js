(function(){
	
	function AnimationStore(animation) {
		this.animation = animation;
		animation.store = this;
		this.animationsContainerEl = $("#animations-container");
		this.animationsEl = $("#animations");
		this.saveAsEl = $("#save-animation");
		this.initialRequestSize = 1024 * 1024; // 1MB
		this.currentAnimation = null;
		this.animationsByName = {};
		this.init();
	}

	AnimationStore.prototype = {
		defaultAnimationName: "Default",
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
		},

		onFileSystemCreated: function(fileSystem) {
			this.animationsContainerEl.show();
			this.fileSystem = fileSystem;
			this.loadAnimations();
			this.loadAnimation(this.defaultAnimationName);
		},

		loadAnimations: function() {
			var reader = this.fileSystem.root.createReader(),
				self = this;
			this.animationsEl.empty();
			reader.readEntries(function(list) {
				$.each(list, function(i, entry) {
					if (!entry.isFile)
						return;
					self.addAnimation(entry.name);
				});
			});
		},

		addAnimation: function(path) {
			var el = this.animationsByName["_" + path];
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
		},

		loadAnimation: function(animation) {
			this.setActiveAnimation(animation);
			if (!this.fileSystem)
				return;
			var self = this;
			this.fileSystem.root.getFile(animation, null, function(entry) {
				if (!entry.isFile)
					return;
				entry.file(function(file) {
					var reader = new FileReader();
					reader.onload = function() {
						var parsedAnimation = null;
						try {
							parsedAnimation = JSON.parse(reader.result);
						} catch (e) {
							console.error(e);
						}
						if (!parsedAnimation)
							return;
						self.animation.loadAnimation(parsedAnimation);
					};
					reader.readAsText(file, "UTF-8");
				});
			}, function(e) {
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
			this.fileSystem.root.getFile(animation, {
				create: true
			}, function(entry) {
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
		}
	};

	Global.AnimationStore = AnimationStore;

})();