(function() {

    Global.CSSGenerators = {};

    Global.CSSGenerators.identity = Global.Utils.identity;

    Global.CSSGenerators.transform = function(v, colors) {
        return [colors.fn("rotateX", [colors.value(v.rotationX || 0, "deg")]),
        colors.fn("rotateY", [colors.value(v.rotationY || 0, "deg")]),
        colors.fn("rotateZ", [colors.value(v.rotationZ || 0, "deg")])].join(" ");
    }
     
    Global.CSSGenerators.filterArray = function(values, colors) {
       return colors.fn("array", values);
    }
        
    Global.CSSGenerators.vector = function(values, colors) {
        return $.map(values, function(val) { return colors.value(val); }).join(" ");
    }

    Global.CSSGenerators.color = function(values, colors) {
        return colors.fn("rgba", $.map(values, function(val, index) { 
            if (index < 3)
                return colors.value(Math.round(val * 255));
            return colors.value(val); 
        }));
    }

    Global.CSSGenerators.warpArray = function(values, colors) {
        return Global.WarpHelpers.generateWarpArray(values, colors);
    }

})();