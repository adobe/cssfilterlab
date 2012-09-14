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
	
	function CodeEditor(el) {
		CodeEditor.super.call(this);

		// For performance reasons we will keep the code-mirror editor in a absolute posioned element
		// attached directly to body. This way we will avoid long layouts and long paint times due to
		// flex-box implementation.
		// We will keep the original element around to make it easy to steal its coordinates.
		this.uiElement = el;

		this.element = $("<div />").addClass("code-editor").hide().css("position", "absolute").appendTo(document.body);

		var self = this;
		this.editor = CodeMirror(this.element[0], {
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

		setActive: function(active) {
			this.element.toggle(active);
			if (active)
				this.refresh();
		},

		refresh: function() {
			var clientRect = this.uiElement[0].getBoundingClientRect();
			this.element.css({
				"left": clientRect.left,
				"top": clientRect.top,
				"width": clientRect.width,
				"height": clientRect.height
			});
			$(this.editor.getScrollerElement()).height(this.element.outerHeight());
			this.editor.refresh();
		}
	});

	Global.CodeEditor = CodeEditor;

})()