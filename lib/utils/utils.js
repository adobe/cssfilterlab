(function() {

    var Global = window.Global = {};
    
    /*
     * Helper function to extend the prototype of a class from another base class
     * Global.Utils.extend(Cat).from(Animal);
     */
    Global.Utils = {
        extend: function(newClass) {
            return {
                from: function(baseClass) {
                    newClass.prototype = Object.create(baseClass.prototype);
                    newClass.super = baseClass;
                    newClass.prototype.super = baseClass.prototype;
                }
            }
        },

        identity: function(a) { return a; },

        clone: function(a) {
            return JSON.parse(JSON.stringify(a));
        }

    };

})();