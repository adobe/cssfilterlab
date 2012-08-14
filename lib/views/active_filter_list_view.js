(function(){
	
	function ActiveFilterListView(filterList, shaderEditor) {
		this.filterList = filterList;
		this.filterList.on("filterAdded", this.onFilterAdded.bind(this));
		this.filterList.on("filterRemoved", this.onFilterRemoved.bind(this));
		this.container = $("#filter-list");
        this.filterMessageEl = $("#filter-list-empty");

        this.shaderEditor = shaderEditor;

        this.makeDragable();
        this.updateFilterCount();
	}

	ActiveFilterListView.prototype = {
		updateFilterCount: function() {
            this.filterMessageEl.toggle(!this.filterList.filters.length);
        },

        makeDragable: function() {
            var self = this;
            this.container.sortable({
                distance: 15,
                axis: 'y',
                items: 'li',
                handle: '.dragpoint',
                start: function(event, ui) {
                    ui.helper.addClass("dragging");
                },
                beforeStop: function(event, ui) {
                    ui.helper.removeClass("dragging");
                },            
                update: function(event, ui) {
                    $(this).find("li").each(function (index, el) {
                        var filter = $(el).data("filter");
                        if (filter)
                            filter.order = index;
                    });
                    self.filters.sort(function(a, b) { return a.order - b.order; });
                    if (self.animation) {
                        self.animation.updateFilters();
                        self.animation.saveAnimation();
                    }
                }
            });
        },

        onFilterAdded: function(filter) {
        	var itemEl = filter.generateFilterItem();
            $(itemEl).data("filter", filter);
            this.container.append(itemEl);
            this.updateFilterCount();
        },

        onFilterRemoved: function(filter) {
        	var self = this;
            filter.el.slideUp(100, function() {
                filter.el.remove();
                self.updateFilterCount();
            });
        }
	};

	Global.ActiveFilterListView = ActiveFilterListView;

})();