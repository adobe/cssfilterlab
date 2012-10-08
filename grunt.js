module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        copy: {
            assets: {
                files: {
                    "dist/dev/images/": "images/**",
                    "dist/dev/shaders/": "shaders/**",
                    "dist/dev/lib/": "lib/**",
                    "dist/dev/configs.js": "configs.js",
                    "dist/dev/style/img/": "style/img/**",
                    "dist/dev/style/font/": "style/font/**",
                    "dist/dev/third_party/angle/": "third_party/angle/**",
                    "dist/dev/third_party/CodeMirror/": 
                        [
                            "third_party/CodeMirror/lib/codemirror.css", 
                            "third_party/CodeMirror/lib/codemirror.js",
                            "third_party/CodeMirror/mode/clike/clike.js"
                        ],
                    "dist/dev/third_party/jquery/": "third_party/jquery/**",
                    
                    "dist/prod/images/": "images/**",
                    "dist/prod/shaders/": "shaders/**",
                    "dist/prod/style/img/": "style/img/**",
                    "dist/prod/style/font/": "style/font/**",
                    "dist/prod/third_party/angle/": "third_party/angle/**",
                    "dist/prod/third_party/CodeMirror/": 
                        [
                            "third_party/CodeMirror/lib/codemirror.css", 
                            "third_party/CodeMirror/lib/codemirror.js",
                            "third_party/CodeMirror/mode/clike/clike.js"
                        ],
                    "dist/prod/third_party/jquery/": "third_party/jquery/**"
                }
            }
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<config:lint.all>'],
                dest: 'dist/prod/<%= concat.dist.name %>',
                name: 'lib/<%= pkg.name %>.js'
            },
            css: {
                src: ['<banner:meta.banner>', '<config:cssmin.css.dest>'],
                dest: '<config:cssmin.css.dest>'
            },
            index_dev: {
                src: ['<html:index.html:concat.index_dev.js:concat.index_dev.css>'],
                dest: 'dist/dev/index.html',
                js: [
                    "third_party/jquery/jquery-1.8.0.min.js",
                    "third_party/jquery/jquery-ui-1.8.23.custom.min.js",
                    "third_party/CodeMirror/lib/codemirror.js",
                    '<config:lint.all>'
                ],
                css: ['style/css/app.css', 'third_party/CodeMirror/lib/codemirror.css']
            },
            index_prod_min: {
                src: ['<html:index.html:concat.index_prod_min.js:concat.index_prod_min.css>'],
                dest: 'dist/prod/index.html',
                js: [
                    "third_party/jquery/jquery-1.8.0.min.js",
                    "third_party/jquery/jquery-ui-1.8.23.custom.min.js",
                    "third_party/CodeMirror/lib/codemirror.js",
                    "third_party/CodeMirror/mode/clike/clike.js",
                    '<config:min.dist.name>'
                ],
                css: ['style/css/app.min.css', 'third_party/CodeMirror/lib/codemirror.css']
            },
            index_prod_dev: {
                src: ['<html:index.html:concat.index_prod_dev.js:concat.index_prod_dev.css>'],
                dest: 'dist/prod/index.dev.html',
                js: [
                    "third_party/jquery/jquery-1.8.0.min.js",
                    "third_party/jquery/jquery-ui-1.8.23.custom.min.js",
                    "third_party/CodeMirror/lib/codemirror.js",
                    '<config:concat.dist.name>'
                ],
                css: ['style/css/app.css', 'third_party/CodeMirror/lib/codemirror.css']
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/prod/<%= min.dist.name %>',
                name: 'lib/<%= pkg.name %>.min.js'
            }
        },
        lint: {
            grunt: ['grunt.js'],
            /* Note that the order of loading the files is important. */
            all: [  
                "configs.js", 
                "lib/utils/utils.js", 
                "lib/utils/event_dispatcher.js", 
                "lib/application.js", 
                "lib/controls/base_control.js", 
                "lib/controls/code_editor.js", 
                "lib/controls/multi_control.js", 
                "lib/controls/color_control.js", 
                "lib/controls/checkbox_control.js", 
                "lib/controls/vector_control.js", 
                "lib/controls/editable_label.js", 
                "lib/controls/range_control.js", 
                "lib/controls/transform_control.js", 
                "lib/controls/text_control.js", 
                "lib/controls/warp_control.js", 
                "lib/models/active_object.js", 
                "lib/models/animation.js", 
                "lib/models/preset_store.js", 
                "lib/models/filter_config.js", 
                "lib/models/filter.js", 
                "lib/models/filter_store.js", 
                "lib/models/filter_list.js", 
                "lib/models/github.js", 
                "lib/models/keyframe.js", 
                "lib/utils/angle_lib.js", 
                "lib/utils/color_scheme.js", 
                "lib/utils/config.js", 
                "lib/utils/css_generators.js", 
                "lib/utils/local_storage.js", 
                "lib/utils/mixers.js", 
                "lib/utils/timer.js", 
                "lib/utils/warp_helpers.js", 
                "lib/views/filter_store_view.js", 
                "lib/views/active_filter_list_view.js", 
                "lib/views/css_code_view.js", 
                "lib/views/filter_item_view.js", 
                "lib/views/preset_store_view.js", 
                "lib/views/loading_progress_view.js", 
                "lib/views/logo_view.js", 
                "lib/views/help_view.js", 
                "lib/views/import_filter_view.js", 
                "lib/views/shader_editor_view.js", 
                "lib/views/shader_code_editor_view.js", 
                "lib/views/timeline_view.js", 
                "lib/views/dock_column.js", 
                "lib/views/dock_view.js", 
                "lib/views/dock_container.js", 
                "lib/views/dock_panel.js"
            ]
        },
        watch: {
            js: {
                files: '<config:lint.all>',
                tasks: 'lint'
            },
            css: {
                files: 'style/app.scss',
                tasks: ['compass:dev', 'compass:prod']
            }
        },
        compass: {
            dev: {
                src: 'style/',
                dest: 'dist/dev/style/css/',
                linecomments: true,
                forcecompile: true
            },
            prod: {
                src: 'style/',
                dest: 'dist/prod/style/css/',
                linecomments: false,
                forcecompile: true
            }
        },
        jshint: {
            options: {
                asi: true,
                curly: false,
                eqeqeq: false,
                immed: false,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                jquery: true,
                browser: true,
                devel: true
            },
            globals: {
                exports: true,
                module: false,
                Global: true,
                filterConfigs: true,
                CodeMirror: true
            }
        },
        uglify: {},
        cssmin: {
            css: {
                src: 'dist/prod/style/css/app.css',
                dest: 'dist/prod/style/css/app.min.css'
            }
        }
    });

    grunt.registerHelper('scripts', function(scriptsVariable) {
        var scripts = grunt.helper("config", scriptsVariable);
        scripts = Array.isArray(scripts) ? scripts : [scripts];
        return grunt.utils._(scripts).chain().flatten().map(function(script) { return "<script src=\"" + script + "\"></script>\n"; }).value().join("    ");
    });

    grunt.registerHelper('css', function(cssVariable) {
        var css = grunt.helper("config", cssVariable);
        css = Array.isArray(css) ? css : [css];
        return grunt.utils._(css).chain().flatten().map(function(cssFile) { return "<link rel=\"stylesheet\" href=\"" + cssFile + "\">\n"; }).value().join("    ");
    });

    grunt.registerHelper('html', function(fileSrc, scripts, css) {
        var fileContents = grunt.task.directive(fileSrc, grunt.file.read),
            scriptsTags = grunt.template.process(grunt.helper("scripts", scripts)),
            cssTags = grunt.template.process(grunt.helper("css", css));
        return grunt.template.process(fileContents, {
            scripts: scriptsTags,
            css: cssTags
        })
    });

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-compass');
    grunt.loadNpmTasks('grunt-css');

    // Default task.
    grunt.registerTask('default', 'concat:index_dev concat:index_prod_min concat:index_prod_dev copy:assets lint concat:dist min compass cssmin concat:css');

};