/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

(function () {
    /**
     * Generates a one dimentional convolution kernel for the given standard deviation.
     * 
     * @param stdDeviation the blur's standard deviation.
     * @see gaussian.fs for an explanation of Gaussian convolutions.
     */
    function generateBlurKernel(stdDeviation, theme) {
        var s = stdDeviation;
        var s2 = s * s;
        var two_s2 = 2.0 * s2;
        var startX = - Math.ceil(s) * 3;
        var endX = -startX;
        var kernel = [];
        var totalWeight = 0;
        var weight;
        var D = Math.sqrt(2.0 * Math.PI * s2);
        
        for (var ci = startX; ci <= endX; ci++) {
            x = ci;
            weight = Math.exp(-x * x / two_s2) / D;
            kernel.push(weight);
            totalWeight += weight;
        }
        
        // Normalize kernel (make it sum to 1)
        $.each(kernel, function (key, value) { kernel[key] = value / totalWeight; });
        // OpenGL does not accept an empty array. If kernelSize is 0,
        // pass a dummy value.
        if (endX === 0) {
            kernel[0] = 1;
        }
        
        return theme.fn("array", kernel) + ", kernelSize " + endX;
    }
    

    window.generateBlurKernel = generateBlurKernel;
})();