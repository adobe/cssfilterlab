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

    function TimelineView(animation) {
        this.el = $("#timeline")

        this.animation = animation;
        this.animation.on("timeUpdated", this.onTimeUpdated.bind(this));
        this.animation.on("newFrameSelected", this.onNewFrameSelected.bind(this));
        this.animation.on("keyframeAdded", this.onKeyframeAdded.bind(this));
        this.animation.on("keyframeRemoved", this.onKeyframeRemoved.bind(this));
        this.animation.on("durationUpdated", this.onDurationUpdated.bind(this));

        this.doc = $(this.el[0].ownerDocument);
        this.keyframeListEl = this.el.find(".keyframes_list");
        this.playHeadEl = this.el.find(".play_head");

        this.activeKeyFrameEl = $("#toggleActiveKeyframeButton");
        this.prevKeyFrameEl = $("#gotoPrevKeyframeButton");
        this.nextKeyFrameEl = $("#gotoNextKeyframeButton");
        this.playPauseEl = $("#playPauseButton");

        this.timelineDurationEl = $("#timelineDuration");

        this.dockPanel = new Global.DockPanel("Timeline");
        this.el.appendTo(this.dockPanel.el);

        this.isPlaying = false;
        this.startSystemTime = null;
        this.startPlayTime = null;

        this.init();
    }

    TimelineView.prototype = {
        init: function() {
            var self = this;
            this.playHeadEl.mousedown(function(e) {
                self.onHeadMouseDown(e);
            });
            this.activeKeyFrameEl.click(function() {
                self.animation.toggleKeyframe();
            });
            this.playPauseEl.click(function() {
                self.playPause();
            });
            this.prevKeyFrameEl.click(function() {
                self.animation.setActiveKeyframe(self.animation.prevKeyframe());
            });
            this.nextKeyFrameEl.click(function() {
                self.animation.setActiveKeyframe(self.animation.nextKeyframe());
            });
            this.timelineDurationEl.bind("click keyup", function(e) {
                self.animation.setDuration(self.getDuration());
            });
            this.keyframeListEl.bind("click", self.onTimelineClick.bind(self));

            this.updatePlayStateCallback = function() {
                self.updatePlayState();
            }
        },

        getDuration: function() {
            return parseFloat(this.timelineDurationEl.val() * 1000);
        },

        setDuration: function(duration) {
            if (this.getDuration() == duration)
                return;
            this.timelineDurationEl.val(duration / 1000);
        },

        updateTimelineControls: function() {
            this.playHeadEl.css("left", this.animation.currentTime() + "%");
            this.playPauseEl.toggleClass("active", this.isPlaying);
            var keyframe = this.animation.currentKeyframe();
            this.activeKeyFrameEl.toggleClass("active", keyframe && !keyframe.generated);
            this.prevKeyFrameEl.toggleClass("active", !!this.animation.prevKeyframe());
            this.nextKeyFrameEl.toggleClass("active", !!this.animation.nextKeyframe());
        },

        onDurationUpdated: function(duration) {
            this.setDuration(duration);
            this.isPlaying = false;
            this.updateTimelineControls();
        },

        maxTime: function() {
            return this.keyframeListEl.outerWidth();
        },

        onTimelineClick: function(e){
            var timelineOffset = $(this.keyframeListEl).offset(),
                timelineWidth = $(this.keyframeListEl).width(),
                delta = e.pageX - timelineOffset.left,
                newTime = Math.min((delta * 100) / timelineWidth, 100);

            this.animation.setCurrentTime(newTime);
        },

        onHeadMouseDown: function(e) {
            e.preventDefault();
            var self = this,
                playHeadLastMousePosition = event.pageX,
                playHeadLastPosition = this.animation.currentTime(),
                maxTime = this.maxTime();

            function mousemove(e) {
                e.preventDefault();
                var delta = (event.pageX - playHeadLastMousePosition) / maxTime * 100,
                    newTime = Math.min(Math.max(playHeadLastPosition + delta, 0), 100);
                self.animation.setCurrentTime(newTime);
            }

            function mouseup(e) {
                e.preventDefault();
                self.doc.unbind("mousemove", mousemove);
                self.doc.unbind("mouseup", mouseup);
            }

            this.doc.mousemove(mousemove);
            this.doc.mouseup(mouseup);
        },

        onKeyframeAdded: function(keyframe) {
            var self = this,
                el = $("<div class='keyframe'></div>")
                .appendTo(this.keyframeListEl)
                .css("left", keyframe.time + "%");

            keyframe.el = el;

            // don't let the timeline catch this because it will set a new time.
            el.on('click', function(e){
                e.stopPropagation()
            })

            el.mousedown(function(e) {
                e.preventDefault();
                var frameLastMousePosition = event.pageX,
                    frameLastPosition = keyframe.time,
                    maxTime = self.maxTime();

                self.animation.setCurrentTime(keyframe.time);

                function mousemove(e) {
                    e.preventDefault();
                    var delta = (event.pageX - frameLastMousePosition) / maxTime * 100,
                        newTime = Math.min(Math.max(frameLastPosition + delta, 0), 100);
                    keyframe.time = newTime;
                    el.css("left", keyframe.time + "%");
                    self.animation.sortKeyframes();
                    self.animation.setCurrentTime(keyframe.time);
                    self.animation.saveAnimation();
                }

                function mouseup(e) {
                    e.preventDefault();
                    self.doc.unbind("mousemove", mousemove);
                    self.doc.unbind("mouseup", mouseup);
                }

                self.doc.mousemove(mousemove);
                self.doc.mouseup(mouseup);
            });
        },

        updatePlayState: function() {
            if (!this.isPlaying)
                return;
            var systemTime = Date.now(),
                delta = systemTime - this.startSystemTime;

            var newTime = this.startPlayTime + delta / this.animation.duration * 100;
            if (newTime >= 100)
                this.isPlaying = false;

            newTime = Math.min(newTime, 100);
            this.animation.setCurrentTime(newTime);

            if (this.isPlaying)
                webkitRequestAnimationFrame(this.updatePlayStateCallback);
        },

        playPause: function() {
            if (this.isPlaying) {
                this.isPlaying = false;
                this.updateTimelineControls();
            } else {
                this.isPlaying = true;
                this.startSystemTime = Date.now();
                this.startPlayTime = this.animation.currentTime();
                if (this.startPlayTime >= 100)
                    this.startPlayTime = 0;
                this.updateTimelineControls();
                webkitRequestAnimationFrame(this.updatePlayStateCallback);
            }
        },

        onKeyframeRemoved: function(keyframe) {
            if (!keyframe.el)
                return;
            keyframe.el.remove();
            delete keyframe.el;
        },

        onTimeUpdated: function() {
            this.updateTimelineControls();
        },

        onNewFrameSelected: function(newKeyframe, oldKeyframe) {
            if (oldKeyframe && oldKeyframe.el)
                oldKeyframe.el.removeClass("active");
            if (newKeyframe && newKeyframe.el)
                newKeyframe.el.addClass("active");
        }

    }

    Global.TimelineView = TimelineView;

})();
