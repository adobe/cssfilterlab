(function() {
	function ToolsPanelView(timelineView) {
		this.timelineView = timelineView;
		this.init();
	}

	ToolsPanelView.prototype = {
		init: function() {
			var self = this;
            $('#tools_panel .tools_menu1 li')
                .tabToggle($('#tools_panel .content > div'), {selectedClass: "selected"})
                .bind("click", function(e) {
                    self.toggleSlideUpDown($('#tools_panel .content'), true);
                    // FIXME: We only need this in here because the size of the keyframe bar is not
                    // known until the timeline is displayed. Switch to using percentages instead?
                    self.timelineView.updateKeyframePositions();
                });
            $('#tools_toggle').bind("click", function(){
                self.toggleSlideUpDown($('#tools_panel .content'));
                $(this).toggleClass('active')
            });
		},

		toggleSlideUpDown: function(element, forceSlideUp) {
            var $element = $(element),
                state = (typeof forceSlideUp == "boolean") ? forceSlideUp : $element.is(':hidden');
            if (state)
                $element.slideDown(150);
            else
                $element.slideUp(300);
        }
	};

	Global.ToolsPanelView = ToolsPanelView;
})();