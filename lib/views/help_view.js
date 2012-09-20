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
    
    function HelpView(app) {
        this.app = app; 
        this.helpPopupEl = $("#help-popup").detach();
        this.helpPopupCloseEl = $('#help-popup-close', this.helpPopupEl);
        this.helpNav = $('#help-nav a', this.helpPopupEl);
        this.helpArticle = $('article', this.helpPopupEl);

        this.init();
    }

    HelpView.prototype = {
        init: function() {
            $(document).on('click', '#help-link', this.onHelpClicked.bind(this))
            this.helpPopupCloseEl.click(this.onHelpPopupCloseClicked.bind(this));
            this.helpNav.click(this.navigateTo.bind(this));
            
            // select the first help tab
            this.helpNav.eq(0).click();
        },

        show: function(){
            this.helpPopupEl.appendTo(document.body).removeClass("hidden").show();
        },

        onHelpClicked: function(e) {
            this.show();
            return false;
        },

        onHelpPopupCloseClicked: function() { 
            this.helpPopupEl.detach();
            
            if (this.app.firstRun) {
                this.app.fileSystem.save("first_run", "no");
                this.app.firstRun = false;
            }

            return false;
        },
        
        navigateTo: function(e){   
            e.stopPropagation();
            e.preventDefault();
            this.helpArticle.find('div').hide().filter(e.target.hash).show();
            this.helpNav.removeClass('selected').filter($(e.target)).addClass('selected');
        }
    }

    Global.HelpView = HelpView;

})();