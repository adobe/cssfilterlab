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

    function ImportFilterView(filterStore) {
        this.filterStore = filterStore;

        this.dockPanel = new Global.DockPanel("Import via Gist");
        this.el = $("#import-filter").appendTo(this.dockPanel.el);
        this.hasErrorState = false;

        this.importErrorPrompt = this.el.find('.error');
        this.importFilterForm = this.el.find('form');
        this.importFilterButton = this.importFilterForm.find('.button');
        this.importFilterInput = this.importFilterForm.find('input[name="gist-url"]');

        this.init();
    }

    ImportFilterView.prototype = {
        init: function() {
            this.importFilterForm.on('submit', this.onImportFilter.bind(this));
            this.importFilterButton.on('click', this.onImportFilter.bind(this));
            this.importFilterInput.on('keyup paste', this.onFilterInputChange.bind(this));
        },

        onImportFilterError: function() {
            this.hasErrorState = true;
            this.showErrorState();
        },

        showErrorState: function(){
            this.importErrorPrompt.show();
            this.importFilterInput.addClass('error');
        },

        removeErrorState: function(){
            this.importErrorPrompt.hide();
            this.importFilterInput.removeClass('error');
        },

        onFilterInputChange: function(e){
            this.importFilterButton.toggleClass('disabled', !this.importFilterInput.is(':valid'))
            this.importFilterInput.removeClass('error');
        },

        onImportFilter: function(e) {
            e.preventDefault()

            if (!this.importFilterInput.is(':valid'))
                return

            var url = this.importFilterInput.val(),
                self = this;

            this.filterStore.loadFromGitHub(url, function(err, filter) {
                if (err){
                    self.onImportFilterError()
                    return
                }

                if (self.hasErrorState){
                    self.removeErrorState()
                }

                self.importFilterInput.val('')
            });
        }
    }

    Global.ImportFilterView = ImportFilterView;

})();
