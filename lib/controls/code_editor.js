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