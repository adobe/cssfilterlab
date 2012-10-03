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
    
    function ShaderCodeEditorView(angleLib, shaderType, codeEditorEl, errorsPanelEl) {
        ShaderCodeEditorView.$super.call(this, codeEditorEl);
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

                $("<div />").addClass("header").text(Global.Utils.upperCaseFirstLetter(self.shaderType) + 
                    " shader errors").appendTo(self.errorsPanelEl);

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