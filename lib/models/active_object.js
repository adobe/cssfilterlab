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

    function ActiveObject(source, delegate) {
        ActiveObject.super.call(this);
        this.delegate = delegate;
        this.properties = {};
        if (source)
            this.loadFromJSON(source);
    }

    function ActiveCollection(source, delegate) {
        ActiveCollection.super.call(this, source, delegate);
    }

    Global.Utils.extend(ActiveObject).from(Global.EventDispatcher);
    Global.Utils.extend(ActiveCollection).from(ActiveObject);

    $.extend(ActiveObject.prototype, {
        loadFromJSON: function(source) {
            var self = this;
            $.each(source, function(key, val) {
                if (!self.properties.hasOwnProperty(key))
                    self.injectSetterMethod(key);
                self.properties[key] = self.wrapValue(val);
            });
        },

        injectSetterMethod: function(key) {
            Object.defineProperty(this, key, {
                get: this.get.bind(this, key),
                set: this.set.bind(this, key),
                enumerable: true,
                configurable: true
            });
        },

        wrapValue: function(val) {
            if (val !== null && typeof(val) == "object") {
                if (val instanceof Array)
                    val = new ActiveCollection(val, this);
                else if (!(val instanceof ActiveObject))
                    val = new ActiveObject(val, this);
            }
            return val;
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
            var oldValue = this.properties[key],
                hadValue = this.properties.hasOwnProperty(key);
            if (!hadValue)
                this.injectSetterMethod(key);
            this.properties[key] = newValue = this.wrapValue(newValue);
            this.fire("propertyChanged." + key, [newValue, oldValue]);
            this.fire("propertyChanged", [key, newValue, oldValue]);
            if (!hadValue)
                this.fire("propertyAdded", [key, newValue]);
            this.fireRootValueChanged();
            return newValue;
        },

        get: function(key) {
            return this.properties[key];
        },

        remove: function(key) {
            var oldValue = this.properties[key],
                hadValue = this.properties.hasOwnProperty(key);
            if (!hadValue)
                return;
            delete this.properties[key];
            this.fire("propertyChanged." + key, [null, oldValue]);
            this.fire("propertyChanged", [key, null, oldValue]);
            this.fire("propertyRemoved", [key, oldValue]);
            this.fireRootValueChanged();
            return oldValue;
        },

        bind: function(key, fn) {
            fn(this.get(key), null);
            return this.on("propertyChanged." + key, fn);
        },

        unbind: function(key, fn) {
            return this.off("propertyChanged." + key, fn);
        },

        oneWayBind: function(key, el, fn) {
            this.bind(key, function(newValue, oldValue) {
                var value = el[fn].call(el);
                if (oldValue != null && value == newValue)
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
            return this.twoWayBind(key, el, "val", "change keyup blur");
        },

        bindToSelectInput: function(key, el) {
            return this.twoWayBind(key, el, "val", "change keyup click blur");
        }
    });

    $.extend(ActiveCollection.prototype, {
        loadFromJSON: function(source) {
            this.super.loadFromJSON.call(this, source);
            this.set("length", source.length);
        },

        toJSON: function() {
            var result = [];
            $.each(this.properties, function(key, value) {
                if (value && value instanceof ActiveObject)
                    value = value.toJSON();
                result.push(value);
            });
            return result;
        }
    });

    Global.ActiveObject = ActiveObject;
    Global.ActiveCollection = ActiveCollection;

})();
