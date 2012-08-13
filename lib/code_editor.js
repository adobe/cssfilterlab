(function(){
	
	function CodeEditor(el) {
		this.element = el;
		this.editor = CodeMirror(el[0], {
	        lineNumbers: true,
	        matchBrackets: true,
	        mode: "text/x-csrc"
	    });
	}

	CodeEditor.prototype = {
		setValue: function(value) {
			this.editor.setValue(value);
		},

		refresh: function() {
			$(this.editor.getScrollerElement()).height(this.element.outerHeight());
			this.editor.refresh();
		}
	}

	Global.CodeEditor = CodeEditor;

})()