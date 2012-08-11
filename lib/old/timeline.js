/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

(function () {
    
    function cloneFrame(a) {
        return JSON.parse(JSON.stringify(a));
    }
    
    function buildTimeline(timeline, keyframesBar, playHead, updateCallback, generateKeyframe, calculateKeyframe) {
        var doc = $(document);
        playHead.css("left", "0px");
        
        var maxTime = keyframesBar.innerWidth();
        var animationDuration = 500;
        
        var keyframesRef = [];
        var _cachedCurrentKeyFrame = null; // stores only the exact selected frame
        var _cachedCurrentKeyframeSet = null; // stores an array of frames, that are near the playhead
        
        var isPlaying = false;
        
        function privateKeyframes() 
        {
            return keyframesRef;
        }

        function currentTime() {
            return parseFloat(playHead.css("left")) || 0;
        }
        
        function privateMaxTime() {
            return maxTime;
        }
        
        function privateCurrentKeyframeSet(time) {
            var keyframes = privateKeyframes();
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
        }
        
        function privateCurrentKeyframe(time) {
            var set = currentKeyframeSet(time);
            if (!set)
                return null;
            if (set.length == 1)
                return set[0];
            return null;
        }
        
        function currentKeyframe(time) {
            if (time === undefined || time == currentTime())
                return _cachedCurrentKeyFrame;
            return privateCurrentKeyframe(time);
        }
        
        function currentKeyframeSet(time) {
            if (time === undefined || time == currentTime())
                return _cachedCurrentKeyframeSet;
            return privateCurrentKeyframeSet(time);
        }
        
        function updateCachedValues() {
            var oldKeyframe = _cachedCurrentKeyFrame;
            
            var time = currentTime();
            _cachedCurrentKeyframeSet = privateCurrentKeyframeSet(time);
            _cachedCurrentKeyFrame = privateCurrentKeyframe(time);
            
            if (oldKeyframe !== _cachedCurrentKeyFrame) {
                if (oldKeyframe)
                    oldKeyframe.el.removeClass("selected");
                if (_cachedCurrentKeyFrame)
                    _cachedCurrentKeyFrame.el.addClass("selected");
            }
        }
        
        function update() {
            updateCachedValues();
            updateCallback();
        }
        
        function setCurrentTime(newTime) {
            playHead.css("left", (newTime) + "px");
            update();
        }
        
        playHead.mousedown(function(e) {
            e.preventDefault();
            var playHeadLastMousePosition = event.pageX;
            var playHeadLastPosition = parseFloat(playHead.css("left")) || 0;

            function mousemove(e) {
                e.preventDefault();
                var delta = event.pageX - playHeadLastMousePosition;
                var newTime = Math.min(Math.max(playHeadLastPosition + delta, 0), maxTime);
                setCurrentTime(newTime);
            }

            function mouseup(e) {
                e.preventDefault();
                doc.unbind("mousemove", mousemove);
                doc.unbind("mouseup", mouseup);
            }

            doc.mousemove(mousemove);
            doc.mouseup(mouseup);
        });

        function sortKeyframes() {
            var keyframes = privateKeyframes();
            keyframes.sort(function(a, b){ return a.time - b.time; });
        }

        function createKeyframe(time, source) {
            var el = $("<div class='keyframe'></div>").appendTo(keyframesBar).css("left", time + "px");
            var keyframe = {
                time: time,
                value: source,
                el: el
            };
            var keyframes = privateKeyframes();
            keyframes.push(keyframe);
            sortKeyframes();
            update();

            el.mousedown(function(e) {
                e.preventDefault();
                var frameLastMousePosition = event.pageX;
                var frameLastPosition = keyframe.time;
                
                setCurrentTime(keyframe.time);

                function mousemove(e) {
                    e.preventDefault();
                    var delta = event.pageX - frameLastMousePosition;
                    keyframe.time = Math.min(Math.max(frameLastPosition + delta, 0), maxTime);
                    el.css("left", keyframe.time + "px");
                    sortKeyframes();
                    setCurrentTime(keyframe.time);
                    update();
                }

                function mouseup(e) {
                    e.preventDefault();
                    doc.unbind("mousemove", mousemove);
                    doc.unbind("mouseup", mouseup);
                }

                doc.mousemove(mousemove);
                doc.mouseup(mouseup);
            });
        }

        function createKeyframeNow() {
            var time = currentTime();
            var keyframes = privateKeyframes();
            // Avoid duplicating keyframes.
            for (var i=0; i<keyframes.length; ++i) {
                if (keyframes[i].time == time)
                    return;
            }
            
            var frame = calculateKeyframe(time);
            if (frame && frame)
                createKeyframe(time, cloneFrame(frame));
            else
                createKeyframe(time, generateKeyframe());
            update();
        }

        function deleteCurrentKeyframe() {
            var keyframe = currentKeyframe();
            if (!keyframe)
                return;
            var keyframes = privateKeyframes();
            var i = keyframes.indexOf(keyframe);
            keyframes.splice(i, 1);
            keyframe.el.remove();
            update();
        }
        
        function prevKeyframe() {
            var keyframes = privateKeyframes();
            if (!keyframes || !keyframes.length)
                return null;
            
            var time = currentTime();
            if (time <= keyframes[0].time)
                return null;
            if (time > keyframes[keyframes.length - 1].time)
                return keyframes[keyframes.length - 1];
            
            var set = currentKeyframeSet(time);
            if (!set)
                return null;
            if (set.length != 1)
                return set[0];
            
            var keyframes = privateKeyframes();
            var index = keyframes.indexOf(set[0]);
            if (index <= 0)
                return null;
            return keyframes[index - 1];
        }
        
        function nextKeyframe() {
            var keyframes = privateKeyframes();
            if (!keyframes || !keyframes.length)
                return null;
            
            var time = currentTime();
            if (time >= keyframes[keyframes.length - 1].time)
                return null;
            if (time < keyframes[0].time)
                return keyframes[0];
            
            var set = currentKeyframeSet(time);
            if (!set)
                return null;
            if (set.length != 1)
                return set[1];
                        
            var index = keyframes.indexOf(set[0]);
            if (index < 0 || index > keyframes.length - 2)
                return;
            
            return keyframes[index + 1];
        }
        
        function gotoPrevKeyframe() {
            var prev = prevKeyframe();
            if (prev)
                setCurrentTime(prev.time);
        }
        
        function gotoNextKeyframe() {
            var next = nextKeyframe();
            if (next)
                setCurrentTime(next.time);
        }
        
        function toggleKeyframe() {
            var keyframe = currentKeyframe();
            if (!keyframe) {
                createKeyframeNow();
            } else {
                deleteCurrentKeyframe();
            }
        }
        
        var startSystemTime;
        var startPlayTime;
        
        function updatePlayState() {
            if (!isPlaying)
                return;
            var systemTime = Date.now();
            var delta = systemTime - startSystemTime;
            
            var newTime = startPlayTime + delta / animationDuration * maxTime;
            if (newTime >= maxTime)
                isPlaying = false;
            newTime = Math.min(newTime, maxTime);
            setCurrentTime(newTime);
            
            if (isPlaying)
                webkitRequestAnimationFrame(updatePlayState);
        }
        
        function playPause() {
            if (isPlaying) {
                isPlaying = false;
                update();
            } else {
                isPlaying = true;
                startSystemTime = Date.now();
                startPlayTime = currentTime();
                if (startPlayTime == maxTime)
                    startPlayTime = 0;
                webkitRequestAnimationFrame(updatePlayState);
            }
        }
        
        function setAnimationDuration(duration) {
            animationDuration = duration;
        }
        
        function privateAnimationDuration() {
            return animationDuration;
        }
        
        function privateIsPlaying() {
            return isPlaying;
        }
        
        function reset() {
            var keyframes = privateKeyframes();
            for (var i=0; i<keyframes.length; ++i)
                keyframes[i].el.remove();
            keyframes.splice(0, keyframes.length);
            update();
        }
        
        updateCachedValues();
        return {
            keyframes: privateKeyframes,
            createKeyframe: createKeyframe,
            createKeyframeNow: createKeyframeNow,
            deleteCurrentKeyframe: deleteCurrentKeyframe,
            currentTime: currentTime,
            currentKeyframeSet: currentKeyframeSet,
            currentKeyframe: currentKeyframe,
            maxTime: privateMaxTime,
            gotoPrevKeyframe: gotoPrevKeyframe,
            gotoNextKeyframe: gotoNextKeyframe,
            toggleKeyframe: toggleKeyframe,
            prevKeyframe: prevKeyframe,
            nextKeyframe: nextKeyframe,
            playPause: playPause,
            isPlaying: privateIsPlaying,
            setAnimationDuration: setAnimationDuration,
            animationDuration: privateAnimationDuration,
            reset: reset
        };
    }
    
    window.buildTimeline = buildTimeline;
    window.cloneFrame = cloneFrame;
})();