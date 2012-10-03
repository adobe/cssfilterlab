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
    
    function PresetStoreView(presetStore) {
        this.presetStore = presetStore;
        this.dockPanel = new Global.DockPanel("Presets");
        
        this.activeAnimationEl = $("#active-animation");
        this.animationsEl = $("#animations");
        this.saveAsEl = $("#save-animation");

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
        
        enableSaveAs: function(){
            this.saveAsEl.removeClass('disabled');
        },

        onSaveAsClicked: function() {
            if (this.presetStore.savePresetAs())
                this.saveAsEl.addClass('disabled');
            return false;
        },

        onDeleteClicked: function(preset) {
            this.presetStore.deletePreset(preset);
            this.hidePresets();
        },

        onPresetsLoaded: function() {
            this.animationsContainerEl.show();
        },

        onPresetAdded: function(preset) {
            var key = "_" + preset;
            if (this.presetsByName.hasOwnProperty(key))
                return;
            var el = $("<li />")
                .append($('<a href="#">')
                    .text(preset)
                    .append($('<span>')
                        .addClass('icon icon-remove')
                        .click(function(){                                                                 
                            var message = "Are you sure you want to delete the '"+ preset +"' preset?";
                            if(window.confirm(message))
                                this.onDeleteClicked(preset)
                         }.bind(this))
                     )
                )
                .click(this.onPresetNameClicked.bind(this, preset))
                .appendTo(this.animationsEl);
            this.presetsByName[key] = el;
            return el;
        },

        onPresetNameClicked: function(preset) {
            this.hidePresets();
            this.presetStore.loadPreset(preset);
            return false;
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
            this.activeAnimationEl.text(newPreset);
        }

    };

    Global.PresetStoreView = PresetStoreView;

})()