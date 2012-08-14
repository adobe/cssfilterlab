(function() {
    function Application() {
        this.config = new Global.Config();
        this.config.load(filterConfigs);
        this.fileSystem = new Global.FileSystem();
        this.shaderEditorView = new Global.ShaderEditorView();
        this.filterList = new Global.FilterList(this.config, this.shaderEditorView);
        this.animation = new Global.Animation(this.filterList, $("#container"));
        this.timelineView = new Global.TimelineView(this.animation);
        this.store = new Global.AnimationStore(this.fileSystem, this.animation);
        this.init();
    }
    
    Application.prototype = {
        init: function() {
            var self = this;
            $("#resetTimelineButton").click(function(){
                self.animation.reset();
            });

            $('#tools_panel .tools_menu1 li')
                .tabToggle($('#tools_panel .content > div'), {selectedClass: "selected"})
                .bind("click", function(e){
                    self.toggleSlideUpDown($('#tools_panel .content'), true) 
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

    $(function() {
        window.app = new Application();
    });

    Global.Application = Application;
})();