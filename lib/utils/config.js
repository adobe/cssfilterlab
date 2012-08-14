(function(){
    
    function Config() {
    }
    Global.Config = Config;

    Config.prototype.load = function(config) {
        this.filters = config;
    }

})();