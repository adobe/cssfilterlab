/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
                    newClass.$super = baseClass;
                    newClass.prototype.$super = baseClass.prototype;
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

        checkDefaultNumber: function(value, defaultValue) {
            value = parseFloat(value);
            return isNaN(value) ? defaultValue : value;
        },

        generateBase64Alphabet: function() {
            var a = {},
                charCodeUpperA = "A".charCodeAt(0),
                charCodeLowerA = "a".charCodeAt(0) - 26,
                charCode0 = "0".charCodeAt(0) - 52,
                i;
            for (i = 0; i < 26; ++i)
                a[i] = String.fromCharCode(charCodeUpperA + i);
            for (i = 26; i < 52; ++i)
                a[i] = String.fromCharCode(charCodeLowerA + i);
            for (i = 52; i < 62; ++i)
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

    if (!Function.prototype.bind) {
        Function.prototype.bind = function(thisObj) {
            var args = Array.prototype.slice.call(arguments, 1),
                fn = this;
            return function() {
                return fn.apply(thisObj, args.concat(Array.prototype.slice.call(arguments, 0)));
            }
        }
    }

})();