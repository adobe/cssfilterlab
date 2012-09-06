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
    
    function ActiveObject(source, delegate) {
        ActiveObject.super.call(this);
        this.delegate = delegate;
        this.properties = {};
        if (source)
            this.loadFromJSON(source);
    }

    Global.Utils.extend(ActiveObject).from(Global.EventDispatcher);

    $.extend(ActiveObject.prototype, {
        loadFromJSON: function(source) {
            var self = this;
            $.each(source, function(key, val) {
                if (typeof(val) == "object")
                    val = new ActiveObject(val, this);
                self.properties[key] = val;
            });
        },

        toJSON: function() {
            var result = {};
            $.each(this.properties, function(key, value) {
                if (value && value instanceof ActiveObject)
                    value = value.toJSON();
                result[key] = value;
            });
            return result;
        },

        fireRootValueChanged: function() {
            var root = this;
            while (root.delegate)
                root = root.delegate;
            root.fire("rootValueChanged");
        },

        set: function(key, newValue) {
            var oldValue = this.properties[key];
            this.properties[key] = newValue;
            this.fire("propertyChanged." + key, [newValue, oldValue]);
            this.fire("propertyChanged", [key, newValue, oldValue]);
            this.fireRootValueChanged();
        },

        get: function(key) {
            return this.properties[key];
        },

        bind: function(key, fn) {
            fn(this.get(key), null);
            return this.on("propertyChanged." + key, fn);
        },

        unbind: function(key, fn) {
            return this.off("propertyChanged." + key, fn);
        },

        oneWayBind: function(key, el, fn) {
            this.bind(key, function(newValue) {
                var value = el[fn].call(el);
                if (value == newValue)
                    return;
                el[fn].call(el, newValue);
            });
            return this;
        },

        twoWayBind: function(key, el, fn, events) {
            var self = this;
            this.oneWayBind(key, el, fn);
            el.bind(events, function() {
                var value = el[fn].call(el);
                self.set(key, value);
            });
            return this;
        },

        bindToTextInput: function(key, el) {
            return this.twoWayBind(key, el, "val", "keyup blur");
        }
    });

    Global.ActiveObject = ActiveObject;

})();