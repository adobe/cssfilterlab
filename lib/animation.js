(function() {

    function cloneFrame(a) {
        return JSON.parse(JSON.stringify(a));
    }

    function Animation(timeline, filterList, target) {
        this.timeline = timeline;
        this.filterList = filterList;
        this._keyframes = [];
        this._currentTime = 0;
        this.target = target;
        this.computeDefaultKeyframe();
        this.update();
    }

    Animation.prototype = {

        keyframes: function() {
            return this._keyframes;
        },

        currentTime: function() {
            return this._currentTime;
        },
        
        maxTime: function() {
            return this._maxTime;
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
            return _currentKeyframeSet(time);
        },
        
        updateCachedValues: function() {
            var oldKeyframe = this._cachedCurrentKeyFrame;
            
            var time = this.currentTime();
            this._cachedCurrentKeyframeSet = this._currentKeyframeSet(time);
            this._cachedCurrentKeyFrame = this._currentKeyframe(time);
            
            this.filterList.setSource(this, this._cachedCurrentKeyFrame);
            if (oldKeyframe !== this._cachedCurrentKeyFrame)
                this.timeline.selectNewKeyframe(this._cachedCurrentKeyFrame, oldKeyframe);
        },

        update: function() {
            this.updateCachedValues();
            this.updateFilters();
        },

        setCurrentTime: function(newTime) {
            this._currentTime = newTime;
            update();
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
            this.update();
        },

        getFiltersAtTime: function(time, colorScheme) {
            var filters = this.filterList.activeFilters(),
                keyframe = this.currentKeyframe(time),
                value = keyframe.value,
                result = [];
            $.each(filters, function(i, filter) {
                result.push(filter.generateCode(value[filter.name], colorScheme));
            });
            return result;
        },

        updateFilters: function() {
            var filterProperty = this.getFiltersAtTime(this.currentTime());
            if (!filterProperty)
                return;
            this.target.css("-webkit-filter", filterProperty.join(" "));
        },

        computeDefaultKeyframe: function() {
            this.defaultKeyframe = new Global.Keyframe(this.filterList, 0, this.filterList.defaultValues());
        },   

        calculateKeyframe: function(time) {
            var set = this.currentKeyframeSet();
            if (!set) {
                var keyframes = this.keyframes();
                if (!keyframes.length)
                    return this.defaultKeyframe.makeGeneratedClone();
                
                if (keyframes[0].time > time)
                    return keyframes[0].makeGeneratedClone();
                if (keyframes[keyframes.length - 1].time < time)
                    return keyframes[keyframes.length - 1].makeGeneratedClone();
                throw new Error("ASSERT_NOT_REACHED");
            }
            if (set.length == 1)
                return set[0];
            
            return set[0].blend(set[1], t);
        },

        keyframeUpdated: function(keyframe, filter, paramName) {
            this.updateFilters();
        }
    }

    Global.Animation = Animation;

    Global.cloneFrame = cloneFrame;

})();