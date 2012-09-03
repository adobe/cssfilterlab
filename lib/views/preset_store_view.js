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
	
	function PresetStoreView(presetStore) {
		this.presetStore = presetStore;
		this.dockPanel = new Global.DockPanel("Presets");
		
		this.activeAnimationEl = $("#active-animation");
		this.animationsEl = $("#animations");
		this.saveAsEl = $("#save-animation");
		this.deleteEl = $("#delete-animation");

		this.animationsContainerEl = $("#animations-container").appendTo(this.dockPanel.el);
		
		this.presetsByName = {};
		
		this.outsideLayerEl = $("<div />").addClass("clicks-catcher");

		// move the animations el to the upper most layer
		this.animationsEl.appendTo(document.body);

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

            this.animationsEl.hide();
            this.outsideLayerEl.click(this.hidePresets.bind(this));
            this.activeAnimationEl.click(this.showPresets.bind(this));
        },

        showPresets: function() {
        	var topOffset = this.activeAnimationEl.offset(),
        		height = this.activeAnimationEl.outerHeight(),
        		width = this.activeAnimationEl.outerWidth();
        	this.animationsEl.css("top", topOffset.top + height);
        	this.animationsEl.css("left", topOffset.left);
        	this.animationsEl.css("width", width);
        	this.animationsEl.show();
			this.animationsEl.before(this.outsideLayerEl);
		},

		hidePresets: function() {
			this.animationsEl.hide();
			this.outsideLayerEl.detach();
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
			this.hidePresets();
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
			this.activeAnimationEl.val(newPreset);
		}

	};

	Global.PresetStoreView = PresetStoreView;

})()