(function(){
    /*
     * binding should provide a "setValue" and "getValue".
     */
    function InlineEditor(binding, label) {
        this.binding = binding;
        this.label = label;
        this.init();
    }

    InlineEditor.prototype = {
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
            this.editor = $("<input type='test' class='value-editor' />")
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

    Global.InlineEditor = InlineEditor;

})();