(function() {

    function Timeline(animation, el) {
        this.el = el;
        this.animation = animation;
        this.animation.timeline = this;
        this.doc = $(el[0].ownerDocument);
        this.keyframeListEl = el.find(".keyframes_list");
        this.playHeadEl = el.find(".play_head");

        this._isPlaying = false;

        this.init();
    }

    Timeline.prototype = {
        init: function() {
            var self = this;
            this.playHeadEl.mousedown(function(e) {
                self.onHeadMouseDown(e);
            });
        },

        maxTime: function() {
            return this.keyframeListEl.innerWidth();
        },

        onHeadMouseDown: function(e) {
            e.preventDefault();
            var self = this,
                playHeadLastMousePosition = event.pageX,
                playHeadLastPosition = parseFloat(this.playHeadEl.css("left")) || 0,
                maxTime = this.maxTime();

            function mousemove(e) {
                e.preventDefault();
                var delta = event.pageX - playHeadLastMousePosition,
                    newTime = Math.min(Math.max(playHeadLastPosition + delta, 0), maxTime);
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

        onKeyframeCreated: function(keyframe) {
            var self = this,
                el = $("<div class='keyframe'></div>")
                .appendTo(this.keyframeListEl)
                .css("left", keyframe.time + "px");

            keyframe.el = el;
            
            el.mousedown(function(e) {
                e.preventDefault();
                var frameLastMousePosition = event.pageX,
                    frameLastPosition = keyframe.time,
                    maxTime = self.maxTime();
                
                self.animation.setCurrentTime(keyframe.time);

                function mousemove(e) {
                    e.preventDefault();
                    var delta = event.pageX - frameLastMousePosition;
                    keyframe.time = Math.min(Math.max(frameLastPosition + delta, 0), maxTime);
                    el.css("left", keyframe.time + "px");
                    
                    self.animation.sortKeyframes();
                    self.animation.setCurrentTime(keyframe.time);
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

        onTimeUpdated: function() {
            this.playHeadEl.css("left", this.animation.currentTime() + "px")
        },

        onNewFrameSelected: function(newKeyframe, oldKeyframe) {
            if (oldKeyframe && oldKeyframe.el)
                oldKeyframe.el.removeClass("active");
            if (newKeyframe && newKeyframe.el)
                newKeyframe.el.addClass("active");
        }
    }

    Global.Timeline = Timeline;

})();