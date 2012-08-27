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
                self.addFilter(new Global.FilterConfig(filterName, filterConfig));
            });
            this.fire("filtersLoaded");
            this.fileSystem.register(this.onFileSystemCreated.bind(this));
        },

        onFileSystemCreated: function() {
            var self = this;
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
                    if (!entry.isFile)
                        return;
                    self.loadFork(entry);
                });
            });
        },

        loadFork: function(entry) {
            var self = this,
                wait = 1,
                newFilterConfig;
            this.fileSystem.readFile(entry, function(err, result) {
                if (err)
                    return;
                var parsedConfig = null;
                try {
                    parsedConfig = JSON.parse(result);
                } catch (e) {
                    console.error("Error while parsing stored filter config", result, e);
                    return;
                }
                newFilterConfig = new Global.FilterConfig(parsedConfig.name, parsedConfig);
                newFilterConfig.isFork = true;
                newFilterConfig.forkedFilter = null;
                ++wait;
                
                self.fileSystem.getEntry(self.shadersFolders["vertex"] + "/" + encodeURIComponent(newFilterConfig.name), function(err, entry) {
                    if (err)
                        return;
                    newFilterConfig.edited_vertex = entry.toURL();
                    self.fileSystem.readFile(entry, function(err, result) {
                        newFilterConfig.editedSource_vertex = result;
                        done();
                    });
                });
                
                ++wait;
                self.fileSystem.getEntry(self.shadersFolders["fragment"] + "/" + encodeURIComponent(newFilterConfig.name), function(err, entry) {
                    if (err)
                        return;
                    newFilterConfig.edited_fragment = entry.toURL();
                    self.fileSystem.readFile(entry, function(err, result) {
                        newFilterConfig.editedSource_fragment = result;
                        done();
                    });
                });

                done();
            });

            function done() {
                if (--wait)
                    return;
                self.addFilter(newFilterConfig);
            }
        },

        saveFork: function(filterConfig) {
            var data = JSON.stringify(filterConfig.original);
            this.fileSystem.save(this.forksFolder + "/" + encodeURIComponent(filterConfig.name), data,
                function(err, result) {
                    if (err) {
                        console.log("could not save fork " + filterConfig.name);
                        return;
                    }
                    // Done.
                });
        },

        addFilter: function(filterConfig) {
            var key = "_" + filterConfig.name;
            if (this.availableFiltersByName[key])
                return;
        	this.availableFilters.push(filterConfig);
            this.availableFiltersByName[key] = filterConfig;
            this.fire("filterAdded", [filterConfig]);
        },

        filterConfigByName: function(filterName) {
        	return this.availableFiltersByName["_" + filterName];
        },

        saveShader: function(filter, type, value, callback) {
            var fileName = this.shadersFolders[type] + "/" + encodeURIComponent(filter.name);
            this.fileSystem.save(fileName, value, function(err, entry) {
                if (err) {
                    callback(err);
                    return;
                }
                filter["editedSource_" + type] = value;
                filter["edited_" + type] = entry.toURL();
                callback(null);
            });
        },

        filterUpdate: function(filter, type, value) {
            var self = this;
            this.saveShader(filter, type, value, function() {
                self.fire("filterUpdated", [filter]);
            })
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
            newJSONFilterConfig.name = this.allocateNewName(filterConfig);
            newJSONFilterConfig.hasVertex = true;
            newJSONFilterConfig.hasFragment = true;
        	
            var newFilterConfig = new Global.FilterConfig(newJSONFilterConfig.name, newJSONFilterConfig);
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
                console.log(wait);
                if (--wait)
                    return;
                self.addFilter(newFilterConfig);
                self.saveFork(newFilterConfig);
            }
        }

	});

	Global.FilterStore = FilterStore;

})();