(function(){

    var mixers = {
        mixNumber: function(a, b, t) {
            return a * (1 - t) + b * t;
        },
        
        mixVector: function(a, b, t) {
            var r = [];
            for (var i=0; i<a.length; ++i)
                r.push(mixNumber(a[i], b[i], t));
            return r;
        },
        
        mixVectorOfVectors: function(a, b, t) {
            var r = [];
            for (var i=0; i < a.length; ++i) {
                var row = []; r.push(row);
                var l2 = a[i].length;
                for (var j=0; j < l2; ++j)
                    row.push(Global.mixers.mixVector(a[i][j], b[i][j], t));
            }
            return r;
        },
        
        mixHash: function(fn) {
            var mixFn = Global.mixers[fn];
            return function(a, b, t) {
                var r = {};
                $.each(a, function(key, valueA) {
                    r[key] = mixFn(valueA, b[key], t);
                });
                return r;
            }
        },
        
        dontMix: function(a, b, t) {
            return a;
        }
    };

    Global.mixers = mixers;
})();