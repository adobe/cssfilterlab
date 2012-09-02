(function() {
    
	function FilterStore(config, fileSystem) {
		FilterStore.super.call(this);
		this.config = config;
		this.availableFilters = [];
        this.availableFiltersByName = {};
        this.lastFilterId = 0;
        this.fileSystem = fileSystem;
	}

	Global.Utils.extend(FilterStore).from(Global.EventDispatcher);

	
	$.extend(FilterStore.prototype, {
        forksFolder: "forks",
        shadersFolders: {
            vertex: "vertex",
            "fragment": "fragment"
        },

        defaultVertexShader: "void main() { }",
        defaultFragmentShader: "void main() { }",

		loadFilterConfigurations: function() {
            var self = this;
            $.each(this.config.filters, function(filterName, filterConfig) {
                self.addFilter(new Global.FilterConfig(filterName, filterConfig), true);
            });
            this.fire("filtersLoaded");
            this.fileSystem.register(this.onFileSystemCreated.bind(this));
        },

        onFileSystemCreated: function(fileSystem) {
            var self = this;
            this.fileSystem = fileSystem;
            // Make sure we have the directories first.
            this.fileSystem.createDirectory(this.shadersFolders["vertex"], function(err, dirEntry) {
                self.fileSystem.createDirectory(self.shadersFolders["fragment"], function(err, dirEntry) {
                    self.readForks();
                });
            });
        },

        readForks: function() {
            var self = this;
            this.fileSystem.list(this.forksFolder, function(err, list) {
                if (err) {
                    console.error(err);
                    return;
                }
                $.each(list, function(i, entry) {
                    self.loadFork(entry);
                });
            });
        },

        loadFork: function(entry) {
            var self = this,
                wait = 1,
                newFilterConfig,
                parsedForkJSON = null;
            this.fileSystem.readFile(entry, function(err, result) {
                if (err)
                    return;
                try {
                    parsedForkJSON = JSON.parse(result);
                } catch (e) {
                    console.error("Error while parsing stored filter config", result, e);
                    return;
                }
                newFilterConfig = self.loadedOrPendingFilterByName(parsedForkJSON.name);
                ++wait;
                
                self.fileSystem.getEntry(self.shadersFolders["vertex"] + "/" + encodeURIComponent(parsedForkJSON.name), function(err, entry) {
                    if (err)
                        return;
                    self.fileSystem.readFile(entry, function(err, result) {
                        newFilterConfig.editedSource_vertex = result;
                        newFilterConfig.edited_vertex = entry.toURL(result);
                        done();
                    });
                });
                
                ++wait;
                self.fileSystem.getEntry(self.shadersFolders["fragment"] + "/" + encodeURIComponent(parsedForkJSON.name), function(err, entry) {
                    if (err)
                        return;
                    self.fileSystem.readFile(entry, function(err, result) {
                        newFilterConfig.editedSource_fragment = result;
                        newFilterConfig.edited_fragment = entry.toURL(result);
                        done();
                    });
                });

                done();
            });

            function done() {
                if (--wait)
                    return;
                newFilterConfig.isFork = true;
                newFilterConfig.reload(parsedForkJSON.value);
            }
        },

        saveFork: function(forkJSON) {
            var data = JSON.stringify(forkJSON);
            this.fileSystem.save(this.forksFolder + "/" + encodeURIComponent(forkJSON.name), data,
                function(err, result) {
                    if (err) {
                        console.log("could not save fork " + forkJSON.name);
                        return;
                    }
                    // Done.
                });
        },

        addFilter: function(filterConfig, fromStore) {
            var key = "_" + filterConfig.name,
                filter = this.availableFiltersByName[key];
            if (filter)
                return filter;
        	this.availableFilters.push(filterConfig);
            this.availableFiltersByName[key] = filterConfig;
            this.fire("filterAdded", [filterConfig, fromStore]);
            return filterConfig;
        },

        addLoadingFilter: function(filterName) {
            return this.addFilter(new Global.FilterConfig(filterName, {
                name: filterName,
                loading: true
            }), true);
        },

        filterConfigByName: function(filterName) {
            var key = "_" + filterName;
            return this.availableFiltersByName[key];
        },

        loadedOrPendingFilterByName: function(filterName) {
            var filterConfig = this.filterConfigByName(filterName);
            if (filterConfig)
                return filterConfig;
            // If the filter was not loaded yet, just return a promise
            // that the filter will be loaded.
            return this.addLoadingFilter(filterName);
        },

        saveShader: function(filter, type, value, callback) {
            var fileName = this.shadersFolders[type] + "/" + encodeURIComponent(filter.name);
            this.fileSystem.save(fileName, value, function(err, entry) {
                if (err) {
                    callback(err);
                    return;
                }
                filter["editedSource_" + type] = value;
                filter["edited_" + type] = entry.toURL(value);
                callback(null);
            });
        },

        filterUpdate: function(filter, type, value) {
            var self = this;
            this.saveShader(filter, type, value, function() {
                self.fire("filterUpdated", [filter]);
            })
        },

        forkConfigUpdate: function(filter) {
            this.saveFork({
                name: filter.name,
                value: filter.original
            });
        },

        allocateNewName: function(filterConfig) {
            var name = filterConfig.name;
            while (this.filterConfigByName(name))
                name = filterConfig.name + (++this.lastFilterId);
            return name;
        },

        loadShaderFile: function(url, callback) {
            $.get(url, function(shader) {
                callback(null, shader);
            });
        },

        forkFilter: function(filterConfig) {
            var newJSONFilterConfig = Global.Utils.clone(filterConfig.original);
            var forkJSON = { value: newJSONFilterConfig, name: this.allocateNewName(filterConfig) };
            // The label inside newJSONFilterConfig can be changed by the user, but forkJSON.name will stay the same.
            delete newJSONFilterConfig["name"];
            newJSONFilterConfig.label = forkJSON.name;
            newJSONFilterConfig.hasVertex = true;
            newJSONFilterConfig.hasFragment = true;
        	
            var newFilterConfig = new Global.FilterConfig(forkJSON.name, newJSONFilterConfig);
        	newFilterConfig.isFork = true;
            newFilterConfig.forkedFilter = filterConfig;

            var wait = 1,
                self = this;

            if (filterConfig.hasVertex) {
                ++wait;
                this.loadShaderFile(filterConfig.getVertexUrl(), function(err, result) {
                    if (err)
                        return;
                    self.saveShader(newFilterConfig, "vertex", result, function(err) {
                        if (err) {
                            console.error("Failed to save vertex", err);
                            return;
                        }
                        done();
                    });
                });
            } else {
                newFilterConfig.editedSource_vertex = this.defaultVertexShader;
            }

            if (!filterConfig.hasVertex || filterConfig.hasFragment) {
                ++wait;
                this.loadShaderFile(filterConfig.getFragmentUrl(), function(err, result) {
                    if (err)
                        return;
                    self.saveShader(newFilterConfig, "fragment", result, function(err) {
                        if (err) {
                            console.error("Failed to save fragment", err);
                            return;
                        }
                        done();
                    });
                });
            } else {
                newFilterConfig.editedSource_fragment = this.defaultFragmentShader;
            }

            done();

        	function done() {
                if (--wait)
                    return;
                self.addFilter(newFilterConfig, false);
                self.saveFork(forkJSON);
            }
        }

	});

	Global.FilterStore = FilterStore;

})();