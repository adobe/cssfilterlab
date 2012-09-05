/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

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
        },

        upperCaseFirstLetter: function(str) {
            if (!str.length)
                return str;
            return str.charAt(0).toUpperCase() + str.substr(1);
        },

        generateBase64Alphabet: function() {
            var a = {},
                charCodeUpperA = "A".charCodeAt(0),
                charCodeLowerA = "a".charCodeAt(0) - 26,
                charCode0 = "0".charCodeAt(0) - 52;
            for (var i = 0; i < 26; ++i)
                a[i] = String.fromCharCode(charCodeUpperA + i);
            for (var i = 26; i < 52; ++i)
                a[i] = String.fromCharCode(charCodeLowerA + i);
            for (var i = 52; i < 62; ++i)
                a[i] = String.fromCharCode(charCode0 + i);
            a[62] = "+";
            a[63] = "/";
            return a;
        },

        encodeBase64: function(val) {
            if (!this._base64Alphabet)
                this._base64Alphabet = this.generateBase64Alphabet();
            var result = "",
                alphabet = this._base64Alphabet;
            for (var i = 0; i < val.length; i += 3) {
                // 1111 11 | 11 2222 | 22 22 33 | 33 3333
                // 1111 11 | 22 2222 | 33 33 33 | 44 4444
                var remaining = val.length - i,
                    a = val.charCodeAt(i),
                    b = (remaining > 1) ? val.charCodeAt(i + 1) : 0,
                    c = (remaining > 2) ? val.charCodeAt(i + 2) : 0,
                    x1 = (a & 0xFC) >> 2,
                    x2 = ((a & 0x3) << 4) | ((b & 0xF0) >> 4),
                    x3 = ((b & 0xF) << 2) | ((c & 0xC0) >> 6),
                    x4 = c & 0x3F;

                switch (remaining) {
                    case 1:
                        result += alphabet[x1] + alphabet[x2] + "==";
                        break;
                    case 2:
                        result += alphabet[x1] + alphabet[x2] + alphabet[x3] + "=";
                        break;
                    default:
                        result += alphabet[x1] + alphabet[x2] + alphabet[x3] + alphabet[x4];
                }
            }
            return result;
        }

    };

})();