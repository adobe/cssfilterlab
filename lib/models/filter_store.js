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
    
    function FilterStore(config, fileSystem, github) {
        FilterStore.$super.call(this);
        this.config = config;
        this.github = github;
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
                newFilterConfig.data = parsedForkJSON.data || {};
                newFilterConfig.reload(parsedForkJSON.value);
            }
        },

        loadFromGitHub: function(url, callback) {
            var self = this;
            this.github.readGist(url, function(err, response) {
                if (err)
                    return callback(err);
                var config = response.files["config.json"],
                    vertex = response.files["shader.vs"],
                    fragment = response.files["shader.fs"];
                if (!config || !vertex || !fragment)
                    return callback("Missing files in the specified gist.");
                var newJSONFilterConfig;
                try {
                    newJSONFilterConfig = JSON.parse(config["content"]);
                } catch (e) {
                    return callback("Could not parse config file.");
                }

                var forkJSON = { value: newJSONFilterConfig, name: self.allocateNewId(response.id), data: {} };
                if (!newJSONFilterConfig.label)
                    newJSONFilterConfig.label = forkJSON.name;
                newJSONFilterConfig.hasVertex = true;
                newJSONFilterConfig.hasFragment = true;
                
                var newFilterConfig = new Global.FilterConfig(forkJSON.name, newJSONFilterConfig);
                newFilterConfig.isFork = true;

                var wait = 2;
                
                self.saveShader(newFilterConfig, "vertex", vertex["content"], function(err) {
                    if (err) {
                        console.error("Failed to save vertex", err);
                        return;
                    }
                    done();
                });

                self.saveShader(newFilterConfig, "fragment", fragment["content"], function(err) {
                    if (err) {
                        console.error("Failed to save fragment", err);
                        return;
                    }
                    done();
                });
                
                function done() {
                    if (--wait)
                        return;
                    self.addFilter(newFilterConfig, false);
                    self.saveFork(forkJSON);
                    callback(null, newFilterConfig);
                }
            });
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
        
        deleteFromFileSystem: function(forkJSON){  
            this.fileSystem.deleteFile(this.forksFolder + "/" + encodeURIComponent(forkJSON.name), 
                function(err, result) {
                    if (err) {
                        console.log("could not delete fork " + forkJSON.name);
                        return;
                    }
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
        
        deleteFilter: function(filterConfig){
            var key = "_" + filterConfig.name,
                filter = this.availableFiltersByName[key];

            delete this.availableFiltersByName[key];
            this.availableFilters.filter(function(filter, index){
                if (filter.name === filterConfig.name){
                    this.availableFilters.splice(index, 1)
                }
            }.bind(this))       
            
            this.deleteFromFileSystem(filterConfig)
            this.fire("filterDeleted", [filterConfig]);
            filterConfig.fire("filterDeleted");
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
                value: filter.original,
                data: filter.data || {}
            });
        },

        allocateNewName: function(filterConfig) {
            return this.allocateNewId(filterConfig.name);
        },

        allocateNewId: function(id) {
            var name = id;
            while (this.filterConfigByName(name))
                name = id + (++this.lastFilterId);
            return name;
        },

        loadShaderFile: function(url, callback) {
            $.get(url, function(shader) {
                callback(null, shader);
            });
        },

        forkFilter: function(filterConfig) {
            var newJSONFilterConfig = Global.Utils.clone(filterConfig.original);
            var forkJSON = { value: newJSONFilterConfig, name: this.allocateNewName(filterConfig), data: {} };
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

            function done() {
                if (--wait)
                    return;
                self.addFilter(newFilterConfig, false);
                self.saveFork(forkJSON);
            }

            done();
        }

    });

    Global.FilterStore = FilterStore;

})();