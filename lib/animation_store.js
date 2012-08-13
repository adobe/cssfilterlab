(function(){
	
	function AnimationStore(fileSystem, animation) {
		this.fileSystem = fileSystem;
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
			var self = this;
			this.fileSystem.register(function() {
				self.onFileSystemCreated();
			});
			this.saveAsEl.click(function() {
				self.saveAnimationAs();
			});
			this.deleteEl.click(function() {
				self.deleteAnimation();
			})
		},

		onFileSystemCreated: function() {
			var self = this;
			
			this.animationsContainerEl.show();
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
			this.fileSystem.list(this.animationsFolder, function(err, list) {
				if (err) {
					console.error(err);
					return;
				}
				self.animationsEl.empty();
				$.each(list, function(i, entry) {
					if (!entry.isFile)
						return;
					self.addAnimation(self.decodeAnimationName(entry.name));
				});
				self.loadAnimation(self.getAnimationFromHash() || self.defaultAnimationName);
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
			var oldEl = this.getAnimationElementByName(this.currentAnimation),
				el = this.getAnimationElementByName(animation);
			if (oldEl) oldEl.removeClass("current");
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
			this.fileSystem.get(this.animationFileName(animation), function(err, result) {
				if (err) {
					// File doesn't exist yet.
					if (animation == self.defaultAnimationName)
						self.saveAnimation();
					else
						self.animation.loadEmptyAnimation();
					return;
				}
				if (animation != self.currentAnimation) {
					// If the animation changed since we loaded it last time,
					// avoid overwritting with some old values.
					return;
				}
				var parsedAnimation = null;
				try {
					parsedAnimation = JSON.parse(result);
				} catch (e) {
					console.error("Error while parsing stored animation", result, e);
				}
				if (!parsedAnimation)
					return;
				self.animation.loadAnimation(parsedAnimation);
			});
		},

		saveAnimation: function() {
			if (!this.fileSystem)
				return;
			var self = this,
				data = this.animation.dumpAnimation(),
				animation = this.currentAnimation;
			this.fileSystem.save(this.animationFileName(animation), JSON.stringify(data), function(err) {
				if (err)
					console.error("Error saving file " + animation, err);
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
			this.fileSystem.deleteFile(this.animationFileName(animation), function(err) {
				// Done.
				var removedEl = self.getAnimationByName(animation);
				delete self.animationsByName["_" + animation];
				removedEl.remove();
			});
		}
	};

	Global.AnimationStore = AnimationStore;

})();