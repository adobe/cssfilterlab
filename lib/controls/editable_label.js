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
                    return;
                self.label.hide();
                self.createEditorIfNeeded();
                self.editor.val(self.binding.getValue());
                self.editor.show().select();
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
            this.binding.setValue(newVal);
            return true;
        }
    }

    Global.EditableLabel = EditableLabel;

})();