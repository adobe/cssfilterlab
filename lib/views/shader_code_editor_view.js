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
    
    function ShaderCodeEditorView(angleLib, shaderType, codeEditorEl, errorsPanelEl) {
        ShaderCodeEditorView.super.call(this, codeEditorEl);
        this.angleLib = angleLib;
        this.shaderType = shaderType;
        this.codeEditorEl = codeEditorEl;
        this.errorsPanelEl = errorsPanelEl;
        this.lastCompileErrorMarkers = [];
        this.on("valueChanged", this.onShaderTextChanged.bind(this));
    }

    Global.Utils.extend(ShaderCodeEditorView).from(Global.CodeEditor);

    $.extend(ShaderCodeEditorView.prototype, {

        onShaderTextChanged: function(newValue) {
            var self = this;
    
            // Remove old errors.            
            this.errorsPanelEl.empty();
            $.each(this.lastCompileErrorMarkers, function(i, error) {
                self.editor.clearMarker(error.gutterMarker);
                error.inlineMarker.clear();
            });
            this.lastCompileErrorMarkers = [];

            this.angleLib.compile(this.shaderType, newValue, function(err, data) {
                if (err) {
                    console.error(err);
                    return;
                }

                // If the code changed since we requested this result, just ignore it.
                if (data.original != self.getValue())
                    return;

                if (!data.errors) {
                    self.fire("uniformsDetected", [data.uniforms]);
                    return;
                }

                $("<div />").addClass("header").text(Global.Utils.upperCaseFirstLetter(self.shaderType) 
                    + " shader errors").appendTo(self.errorsPanelEl);

                $.each(data.errors, function(i, error) {
                    $("<pre />")
                        .append($("<span class='error-type' />").text(error.type))
                        .append($("<span class='error' />").text(error.error))
                        .appendTo(self.errorsPanelEl);
                    
                    var pos = self.editor.posFromIndex(error.index),
                        inlineMarker = self.editor.markText(pos, {line: pos.line, ch: pos.ch + 1}, "error-bookmark"),
                        gutterMarker = self.editor.setMarker(pos.line, "%N%", "error-line");
                    self.lastCompileErrorMarkers.push({
                        inlineMarker: inlineMarker,
                        gutterMarker: gutterMarker
                    });
                });
            });            
        }

    });

    Global.ShaderCodeEditorView = ShaderCodeEditorView;

})();