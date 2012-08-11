(function() {
    function Application() {
        this.config = new Global.Config();
        this.config.load(filterConfigs);
        this.timeline = new Global.Timeline();
        this.filterList = new Global.FilterList(this.config, $("#filter-list"));
        this.animation = new Global.Animation(this.timeline, this.filterList, $("#container"));
    }
    
    Application.prototype = {

    };

    $(function() {
        window.app = new Application();
    });

    Global.Application = Application;
})();