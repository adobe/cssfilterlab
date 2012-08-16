(function(){
	
	function PresetStore(fileSystem, filterStore, animation) {
		PresetStore.super.call(this);

		this.fileSystem = fileSystem;
		this.filterStore = filterStore;
		this.animation = animation;
		animation.store = this;
		
		this.currentPreset = null;
		this.loaded = false;
		this.init();
	}

	Global.Utils.extend(PresetStore).from(Global.EventDispatcher);

	$.extend(PresetStore.prototype, {
		defaultPresetName: "Default",
		presetsFolder: "animations",

		presetFileName: function(preset) {
			return this.presetsFolder + "/" + encodeURIComponent(preset);
		},

		decodePresetName: function(fileName) {
			return decodeURIComponent(fileName);
		},

		init: function() {
			var self = this;
			this.filterStore.on("filtersLoaded", this.onFiltersLoaded.bind(this));
			this.fileSystem.register(function() {
				self.onFileSystemCreated();
			});
		},

		onFileSystemCreated: function() {
			var self = this;

			this.fileSystemLoaded = true;
			this.loadPresetsIfPossible();
			
			window.addEventListener("hashchange", function() {
				var animation = self.getPresetFromHash();
		        if (!animation || animation == self.currentPreset)
		        	return;
		        self.loadAnimation(animation);
		    });
		},

		onFiltersLoaded: function() {
			this.filtersLoaded = true;
			this.loadPresetsIfPossible();
		},

		getPresetFromHash: function() {
			var animation = window.location.hash;
		    if (animation.length <= 1)
		    	return null;
		    return decodeURIComponent(animation.substr(1));
	    },

	    loadPresetsIfPossible: function() {
	    	if (!this.fileSystemLoaded || !this.filtersLoaded)
	    		return;
	    	var self = this;
	    	this.loadPresets(function() {
				self.loadPreset(self.getPresetFromHash() || self.defaultPresetName);
				self.loaded = true;
				self.fire("presetsLoaded");
			});
	    },

		loadPresets: function(callback) {
			var self = this;
			this.fileSystem.list(this.presetsFolder, function(err, list) {
				if (err) {
					console.error(err);
					return;
				}
				$.each(list, function(i, entry) {
					if (!entry.isFile)
						return;
					self.fire("presetAdded", [self.decodePresetName(entry.name)]);
				});
				callback();
			});
		},

		setActivePreset: function(preset) {
			if (this.currentPreset == preset)
				return;
			var oldPreset = this.currentPreset;
			this.currentPreset = preset;
			this.updateHash();
			this.fire("activePresetChanged", [this.currentPreset, oldPreset]);
		},

		updateHash: function() {
			var animation = this.currentPreset;
			if (animation == this.defaultPresetName) {
				if (window.location.hash && window.location.hash.length)
					window.location.hash = "";
				return;
			}
			lastHash = encodeURIComponent(animation);
	        window.location.hash = lastHash;
		},

		loadPreset: function(animation) {
			this.setActivePreset(animation);
			if (!this.fileSystem)
				return;
			var self = this;
			this.fileSystem.get(this.presetFileName(animation), function(err, result) {
				if (err) {
					// File doesn't exist yet.
					if (animation == self.defaultPresetName)
						self.saveAnimation();
					else
						self.animation.loadEmptyAnimation();
					return;
				}
				if (animation != self.currentPreset) {
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
			if (!this.loaded)
				return;
			var self = this,
				data = this.animation.dumpAnimation(),
				animation = this.currentPreset;
			this.fileSystem.save(this.presetFileName(animation), JSON.stringify(data), function(err) {
				if (err)
					console.error("Error saving file " + animation, err);
			});
		},

		savePresetAs: function() {
			var newName = prompt("New preset name:");
			if (!newName)
				return;
			this.setActivePreset(newName);
			this.saveAnimation();
		},

		deletePreset: function() {
			var preset = this.currentPreset;
			if (preset == this.defaultPresetName) {
				this.animation.loadEmptyAnimation();
				this.saveAnimation();
				return;
			}
			var self = this;
			this.loadPreset(this.defaultPresetName);
			this.fileSystem.deleteFile(this.presetFileName(preset), function(err) {
				// Done.
				self.fire("presetRemoved", [preset]);
			});
		}
	});

	Global.PresetStore = PresetStore;

})();