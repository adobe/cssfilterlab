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

    function CSSCodeView(animation) {
        this.animation = animation;
        this.dockPanelCode = new Global.DockPanel("CSS Syntax");
        this.dockPanelAnimationCode = new Global.DockPanel("CSS Animation Syntax");
        this.filterCodeEl = $("#filter-code").appendTo(this.dockPanelCode.el).click(this.selectCode.bind(this));
        this.animationCodeEl = $("#animation-code").appendTo(this.dockPanelAnimationCode.el).click(this.selectCode.bind(this));
        this.animation.on("filtersUpdated", this.onFiltersUpdated.bind(this));
        this.lastFilterCodeHtml = null;
        this.lastAnimationCodeHtml = null;
    }

    CSSCodeView.prototype = {
        NoFiltersAddedText: "No filters applied. Add a filter from the left panel to see the CSS syntax for it.",
        NoAnimationAddedText: "No keyframes applied. Add a filter from the left panel and change the values to see the CSS syntax for it.",

        onFiltersUpdated: function(cssFilters, filterCodeHtml, animationCodeHtml) {
            if (!filterCodeHtml.length)
                filterCodeHtml = this.NoFiltersAddedText;
            if (!animationCodeHtml.length)
                animationCodeHtml = this.NoAnimationAddedText;

            if (filterCodeHtml != this.lastFilterCodeHtml) {
                this.filterCodeEl.html(filterCodeHtml);
                this.lastFilterCodeHtml = filterCodeHtml;
            }
            if (animationCodeHtml != this.lastAnimationCodeHtml) {
                this.animationCodeEl.html(animationCodeHtml);
                this.lastAnimationCodeHtml = animationCodeHtml;
            }
        },

        selectCode: function(ev) {
            document.getSelection().selectAllChildren(ev.currentTarget);
        }
    }

    Global.CSSCodeView = CSSCodeView;

})();
