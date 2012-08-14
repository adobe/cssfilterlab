(function(){
	
	function CodeEditor(el) {
		CodeEditor.super.call(this);

		this.element = el;
		
		var self = this;
		this.editor = CodeMirror(el[0], {
	        lineNumbers: true,
	        matchBrackets: true,
	        mode: "text/x-csrc",
	        onChange: function() {
	        	self.fire("valueChanged", [self.getValue()]);
	        }
	    });
	}

	Global.Utils.extend(CodeEditor).from(Global.EventDispatcher);

	$.extend(CodeEditor.prototype, {
		setValue: function(value) {
			this.editor.setValue(value);
		},

		getValue: function() {
			return this.editor.getValue();
		},

		refresh: function() {
			$(this.editor.getScrollerElement()).height(this.element.outerHeight());
			this.editor.refresh();
		}
	});

	Global.CodeEditor = CodeEditor;

})()