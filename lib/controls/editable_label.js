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

(function(){
    /*
     * binding should provide a "setValue" and "getValue".
     */
    function EditableLabel(binding, label) {
        this.binding = binding;
        this.label = label;
        this.init();
    }

    EditableLabel.prototype = {
        init: function() {
            var self = this;
            this.label.click(function() {
                if (self.binding.canEdit && !self.binding.canEdit())
                    return false;
                self.label.hide();
                self.createEditorIfNeeded();
                self.editor.val(self.binding.getValueForLabelEditor());
                self.editor.show().select();
                return false;
            });
        },

        createEditorIfNeeded: function() {
            if (this.editor)
                return;
            var self = this;
            this.editor = $("<input type='text' class='value-editor' />")
                .hide()
                .change(function() {
                    return self.onChange();
                })
                .focusout(function() {
                    self.hide();
                }).keyup(function (e) {
                    self.onKeyUp(e);
                });
            this.label.after(this.editor);
        },

        hide: function() {
            this.editor.hide();
            this.label.show();
        },

        onKeyUp: function(e) {
            if (e.which == 13) {
                this.hide();
                e.preventDefault();
            }
            if (!this.onChange()) {
                // Rewrite last known good value.
                this.editor.val(self.binding.getValue());
                this.editor.select();
            }
        },

        onChange: function() {
            var newVal = this.editor.val();
            if (this.binding.validate && ((newVal = this.binding.validate(newVal)) === null))
                return false;
            this.binding.setValueFromLabelEditor(newVal);
            return true;
        }
    }

    Global.EditableLabel = EditableLabel;

})();