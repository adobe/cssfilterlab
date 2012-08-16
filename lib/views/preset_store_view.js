(function() {
	
	function PresetStoreView(presetStore) {
		this.presetStore = presetStore;
		this.animationsContainerEl = $("#animations-container");
		this.animationsEl = $("#animations");
		this.saveAsEl = $("#save-animation");
		this.deleteEl = $("#delete-animation");
		this.presetsByName = {};
		this.init();
	}

	PresetStoreView.prototype = {
		init: function() {
			this.saveAsEl.click(this.onSaveAsClicked.bind(this));
			this.deleteEl.click(this.onDeleteClicked.bind(this));
			this.presetStore.on("presetsLoaded", this.onPresetsLoaded.bind(this));
			this.presetStore.on("presetAdded", this.onPresetAdded.bind(this));
			this.presetStore.on("presetRemoved", this.onPresetRemoved.bind(this));
			this.presetStore.on("activePresetChanged", this.onActivePresetChanged.bind(this));
		},

		onSaveAsClicked: function() {
			this.presetStore.savePresetAs();
		},

		onDeleteClicked: function() {
			this.presetStore.deletePreset();
		},

		onPresetsLoaded: function() {
			this.animationsContainerEl.show();
		},

		onPresetAdded: function(preset) {
			var key = "_" + preset;
			if (this.presetsByName.hasOwnProperty(key))
				return;
			var el = $("<li />")
				.text(preset)
				.click(this.onPresetNameClicked.bind(this, preset))
				.appendTo(this.animationsEl);
			this.presetsByName[key] = el;
			return el;
		},

		onPresetNameClicked: function(preset) {
			this.presetStore.loadPreset(preset);
		},

		onPresetRemoved: function(preset) {
			var key = "_" + preset,
				removedEl = this.presetsByName[key];
			if (!removedEl)
				return;
			delete this.presetsByName[key];
			removedEl.remove();
		},

		onActivePresetChanged: function(newPreset, oldPreset) {
			var oldEl = this.presetsByName["_" + oldPreset],
				newEl = this.presetsByName["_" + newPreset];
			if (oldEl) 
				oldEl.removeClass("current");
			if (!newEl)
				newEl = this.onPresetAdded(newPreset);
			newEl.addClass("current");
		},

	};

	Global.PresetStoreView = PresetStoreView;

})()