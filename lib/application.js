(function() {
    function Application() {
        this.config = new Global.Config();
        this.config.load(filterConfigs);
        this.filterList = new Global.FilterList(this.config, $("#filter-list"));
        this.animation = new Global.Animation(this.filterList, $("#container"));
        this.timeline = new Global.Timeline(this.animation, $("#timeline"));
    }
    
    Application.prototype = {

    };

    $(function() {
        window.app = new Application();
    });

    Global.Application = Application;
})();