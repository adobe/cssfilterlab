(function() {

    function Animation(filterList, target) {
        Animation.super.call(this);

        this.filterList = filterList;
        this.filterList.on("filterAdded", this.onFilterAdded.bind(this));
        this.filterList.on("filterRemoved", this.onFilterRemoved.bind(this));
        this.filterList.on("keyframeUpdated", this.onKeyframeUpdated.bind(this));
        this.filterList.on("filterStateChanged", this.onFilterStateChanged.bind(this));
        this.filterList.on("filtersOrderChanged", this.onFiltersOrderChanged.bind(this));

        this._keyframes = [];
        this._currentTime = 0;
        this.duration = 1000;
        
        this.computeDefaultKeyframe();
    }

    Global.Utils.extend(Animation).from(Global.EventDispatcher);

    $.extend(Animation.prototype, {
        keyframes: function() {
            return this._keyframes;
        },

        currentTime: function() {
            return this._currentTime;
        },
        
        maxTime: function() {
            return 100;
        },

        /* Computes the keyframes in the neighborhood of the specified time.
         * - If there is a keyframe at the specific time it will just return an
         * array with a single keyframe.
         * - If there are no keyframes at the specific time it will return an
         * array with 3 elements:
         *   - 0: first keyframe
         *   - 1: second keyframe
         *   - 2: delta time between the keyframes, useful for blending operations.
         */
        _currentKeyframeSet: function(time) {
            var keyframes = this.keyframes();
            if (!keyframes.length)
                return null;

            if (keyframes[0].time > time)
                return null;
            
            if (keyframes[keyframes.length - 1].time < time)
                return null;
                
            for (var i = 0; i < keyframes.length; ++i) {
                if (keyframes[i].time > time)
                    break;
            }
            
            var key1 = keyframes[i - 1];
            if (key1.time == time)
                return [key1];

            var key2 = keyframes[i];

            if (key1.time == key2.time)
                return [key1];
            
            var a = (time - key1.time) / (key2.time - key1.time);
            return [key1, key2, a];
        },

        _currentKeyframe: function (time) {
            var set = this.currentKeyframeSet(time);
            if (set && set.lenght == 1)
                return set[0];
            return this.calculateKeyframe(time);
        },

        currentKeyframe: function(time) {
            if (time === undefined || time == this.currentTime())
                return this._cachedCurrentKeyFrame;
            return this._currentKeyframe(time);
        },
        
        currentKeyframeSet: function(time) {
            if (time === undefined || time == this.currentTime())
                return this._cachedCurrentKeyframeSet;
            return this._currentKeyframeSet(time);
        },

        prevKeyframe: function() {
            var keyframes = this.keyframes();
            if (!keyframes || !keyframes.length)
                return null;
            
            var time = this.currentTime();
            if (time <= keyframes[0].time)
                return null;
            if (time > keyframes[keyframes.length - 1].time)
                return keyframes[keyframes.length - 1];
            
            var set = this.currentKeyframeSet(time);
            if (!set)
                return null;
            if (set.length != 1)
                return set[0];
            
            var index = keyframes.indexOf(set[0]);
            if (index <= 0)
                return null;

            return keyframes[index - 1];
        },

        nextKeyframe: function() {
            var keyframes = this.keyframes();
            if (!keyframes || !keyframes.length)
                return null;
            
            var time = this.currentTime();
            if (time >= keyframes[keyframes.length - 1].time)
                return null;
            if (time < keyframes[0].time)
                return keyframes[0];
            
            var set = this.currentKeyframeSet(time);
            if (!set)
                return null;
            if (set.length != 1)
                return set[1];
                        
            var index = keyframes.indexOf(set[0]);
            if (index < 0 || index > keyframes.length - 2)
                return;
            
            return keyframes[index + 1];
        },
        
        updateCachedValues: function() {
            var oldKeyframe = this._cachedCurrentKeyFrame;
            
            var time = this.currentTime();
            this._cachedCurrentKeyframeSet = this._currentKeyframeSet(time);
            this._cachedCurrentKeyFrame = this._currentKeyframe(time);
            
            this.filterList.setSource(this._cachedCurrentKeyFrame);
            if (oldKeyframe !== this._cachedCurrentKeyFrame)
                this.fire("newFrameSelected", [this._cachedCurrentKeyFrame, oldKeyframe]);
        },

        update: function() {
            this.updateCachedValues();
            this.updateFilters();
            this.fire("timeUpdated");
        },

        setCurrentTime: function(newTime) {
            this._currentTime = newTime;
            this.update();
        },

        setActiveKeyframe: function(keyframe) {
            if (!keyframe)
                return;
            this.setCurrentTime(keyframe.time);
        },

        sortKeyframes: function() {
            var keyframes = this.keyframes();
            keyframes.sort(function(a, b) { return a.time - b.time; });
        },

        createKeyframe: function(time, source) {
            var keyframe = new Global.Keyframe(this.filterList, time, source),
                keyframes = this.keyframes();
            
            keyframes.push(keyframe);
            this.sortKeyframes();
            this.fire("keyframeAdded", [keyframe]);
            this.update();
            this.saveAnimation();
        },

        getFiltersAtTime: function(time, colorScheme) {
            var keyframe = this.currentKeyframe(time);
            return this.getFiltersForKeyframe(keyframe, colorScheme);
        },

        getFiltersForKeyframe: function(keyframe, colorScheme) {
            var filters = this.filterList.activeFilters(),
                value = keyframe.value,
                result = [];
            $.each(filters, function(i, filter) {
                result.push(filter.config.generateCode(value[filter.name], colorScheme));
            });
            return result;
        },

        computeAnimationCode: function(colorScheme) {
            var animation = [];
            if (!this.filterList.activeFilters().length)
                return animation;
            var maxTime = Math.max(1, this.maxTime()),
                self = this;
            $.each(this.keyframes(), function(index, keyframe) {
                var percent = Math.floor(keyframe.time / maxTime * 100) + "%",
                    filters = self.getFiltersForKeyframe(keyframe, colorScheme);
                animation.push(colorScheme.keyframe(percent, filters));
            });
            return animation;
        },

        updateFilters: function() {
            var time = this.currentTime(),
                filterProperty = this.getFiltersAtTime(time),
                filterHtml = this.getFiltersAtTime(time, Global.ColorSchemes.colorTheme),
                animationHtml = this.computeAnimationCode(Global.ColorSchemes.colorTheme);
            this.fire("filtersUpdated", [
                        filterProperty.join(" "), 
                        filterHtml.join("<br />"), 
                        animationHtml.join("")]);
        },

        computeDefaultKeyframe: function() {
            var self = this;
            this.defaultKeyframe = new Global.Keyframe(this.filterList, 0, {});
            $.each(this.filterList.filters, function(i, filter) {
                self.addFilterDefaultValues(filter);
            });
        },

        calculateKeyframe: function(time) {
            var set = this.currentKeyframeSet();
            if (!set) {
                var keyframes = this.keyframes();
                if (!keyframes.length)
                    return this.defaultKeyframe.makeGeneratedClone(time);
                
                if (keyframes[0].time > time)
                    return keyframes[0].makeGeneratedClone(time);
                if (keyframes[keyframes.length - 1].time < time)
                    return keyframes[keyframes.length - 1].makeGeneratedClone(time);
                throw new Error("ASSERT_NOT_REACHED");
            }
            if (set.length == 1)
                return set[0];
            
            return set[0].blend(set[1], set[2], time);
        },

        onFilterStateChanged: function(filter) {
            this.update();
            this.saveAnimation();
        },

        addFilterDefaultValues: function(filter) {
            $.each(this.keyframes(), function(index, keyframe) {
                keyframe.addFilterDefaultValue(filter);
            });
            this.defaultKeyframe.addFilterDefaultValue(filter);
            this.saveAnimation();
        },

        removeFilterValue: function(filter) {
            $.each(this.keyframes(), function(index, keyframe) {
                keyframe.removeFilterValue(filter);
            });
            this.defaultKeyframe.removeFilterValue(filter);
            this.saveAnimation();
        },

        reset: function() {
            var self = this,
                keyframes = this.keyframes();
            $.each(keyframes, function(index, keyframe) {
                self.fire("keyframeRemoved", [keyframe]);
            });
            keyframes.splice(0, keyframes.length);
            this.update();
            this.saveAnimation();
        },

        onKeyframeUpdated: function(keyframe, filter, paramName) {
            if (keyframe.generated)
                this.createKeyframe(keyframe.time, keyframe.value);
            else
                this.updateFilters();
            this.saveAnimation();
        },

        ignoreSaves: function() {
            if (this.savePending)
                clearTimeout(this.savePending);
            this._ignoreSaves = (this._savesIgnore || 0) + 1;
        },

        restoreSaves: function() {
            this._ignoreSaves = (this._savesIgnore || 0) - 1;
        },

        saveAnimation: function() {
            if (!this.store || this._ignoreSaves > 0)
                return;
            var self = this;
            if (this.savePending)
                clearTimeout(this.savePending);
            this.savePending = setTimeout(function() {
                self.store.saveAnimation();
            }, 100);
        },

        removeKeyframe: function(keyframe) {
            var keyframes = this.keyframes();
            var i = keyframes.indexOf(keyframe);
            if (i < 0)
                return;
            this.fire("keyframeRemoved", [keyframe]);
            keyframes.splice(i, 1);
            this.update();
            this.saveAnimation();
        },

        toggleKeyframe: function() {
            var keyframe = this.currentKeyframe();
            if (!keyframe)
                return;
            if (keyframe.generated)
                this.createKeyframe(keyframe.time, keyframe.value);
            else
                this.removeKeyframe(keyframe);
        },

        dumpAnimation: function() {
            var data = {
                filters: [],
                keyframes: [],
                duration: this.duration
            };
            $.each(this.filterList.filters, function(index, filter) {
                data.filters.push({
                    name: filter.name,
                    type: filter.config.name,
                    active: filter.active
                });
            });
            $.each(this.keyframes(), function(index, keyframe) {
                data.keyframes.push({
                    time: keyframe.time,
                    value: Global.Utils.clone(keyframe.value)
                });
            });
            return data;
        },

        setDuration: function(duration) {
            if (duration == this.duration)
                return;
            this.duration = duration;
            this.saveAnimation();
            this.fire("durationUpdated", [duration]);
        },

        loadAnimation: function(animation) {
            this.ignoreSaves();
            this.reset();
            this.filterList.reload(animation.filters);
            this.computeDefaultKeyframe();
            var self = this;
            $.each(animation.keyframes, function(i, keyframe) {
                self.createKeyframe(keyframe.time, keyframe.value);
            });
            this.setDuration(animation.duration);
            this.restoreSaves();
            this.update();
        },

        loadEmptyAnimation: function(animation) {
            this.loadAnimation({
                filters: [],
                keyframes: [],
                duration: 1000
            });
        },

        onFilterAdded: function(filter) {
            this.addFilterDefaultValues(filter);
            this.update();
            this.saveAnimation();
        },

        onFilterRemoved: function(filter) {
            this.removeFilterValue(filter);
            this.update();
            this.saveAnimation();
        },

        onFiltersOrderChanged: function() {
            this.updateFilters();
            this.saveAnimation();
        }
    });

    Global.Animation = Animation;

})();