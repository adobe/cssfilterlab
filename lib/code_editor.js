(function(){
	
	function CodeEditor(el, callback) {
		this.element = el;
		this.changeCallback = callback;
		var self = this;
		this.editor = CodeMirror(el[0], {
	        lineNumbers: true,
	        matchBrackets: true,
	        mode: "text/x-csrc",
	        onChange: function() {
	        	if (callback)
		        	callback(self.editor, self.getValue());
	        }
	    });
	}

	CodeEditor.prototype = {
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
	}

	Global.CodeEditor = CodeEditor;

})()