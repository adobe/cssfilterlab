module.exports = function(grunt) {

    var qunit_lib = 'http://code.jquery.com/qunit/qunit-1.10.0.js';
    var qunit_css = 'http://code.jquery.com/qunit/qunit-1.10.0.css';
    var qunit_html = grunt.file.read("tests/qunit.html");
    
    var project = JSON.parse(grunt.file.read("project.json"));

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
            tests: {
                files: {
                    "dist/tests/": "tests/**"
                }
            },
            assets: {
                files: {
                    "dist/images/": "images/**",
                    "dist/lib/": "lib/**",
                    "dist/configs.js": "configs.js",
                    "dist/shaders/": "shaders/**",
                    "dist/style/img/": "style/img/**",
                    "dist/style/font/": "style/font/**",
                    "dist/third_party/angle/": "third_party/angle/**",
                    "dist/third_party/CodeMirror/": 
                        [
                            "third_party/CodeMirror/lib/codemirror.css", 
                            "third_party/CodeMirror/lib/codemirror.js",
                            "third_party/CodeMirror/mode/clike/clike.js"
                        ],
                    "dist/third_party/jquery/": "third_party/jquery/**"
                }
            }
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<config:lint.all>'],
                dest: 'dist/<%= concat.dist.name %>',
                name: 'lib/<%= pkg.name %>.concat.js'
            },
            css: {
                src: ['<banner:meta.banner>', '<config:cssmin.css.dest>'],
                dest: '<config:cssmin.css.dest>'
            }
        },
        html: {
            index_dev: {
                src: 'index.html',
                dest: 'dist/index.dev.html',
                js: [
                    project.third_party_libs,
                    '<config:lint.all>'
                ],
                css: ['style/css/app.dev.css', project.third_party_css]
            },
            index_dev_qunit: {
                src: 'index.html',
                dest: 'dist/index.dev.qunit.html',
                js: [
                    project.third_party_libs,
                    qunit_lib,
                    '<config:lint.all>',
                    '<config:lint.tests>'
                ],
                css: ['style/css/app.dev.css', project.third_party_css, qunit_css],
                options: {
                    qunit: qunit_html
                }
            },
            index_prod_min: {
                src: 'index.html',
                dest: 'dist/index.html',
                js: [
                    project.third_party_libs,
                    '<config:min.dist.name>'
                ],
                css: ['style/css/app.min.css', project.third_party_css]
            },
            index_prod_min_qunit: {
                src: 'index.html',
                dest: 'dist/index.qunit.html',
                js: [
                    project.third_party_libs,
                    qunit_lib,
                    '<config:min.dist.name>',
                    '<config:lint.tests>'
                ],
                css: ['style/css/app.min.css', project.third_party_css, qunit_css],
                options: {
                    qunit: qunit_html
                }
            },
            index_prod_concat: {
                src: 'index.html',
                dest: 'dist/index.concat.html',
                js: [
                    project.third_party_libs,
                    '<config:concat.dist.name>'
                ],
                css: ['style/css/app.concat.css', project.third_party_css]
            },
            index_prod_concat_qunit: {
                src: 'index.html',
                dest: 'dist/index.concat.qunit.html',
                js: [
                    project.third_party_libs,
                    qunit_lib,
                    '<config:concat.dist.name>',
                    '<config:lint.tests>'
                ],
                css: ['style/css/app.concat.css', project.third_party_css, qunit_css],
                options: {
                    qunit: qunit_html
                }
            }
        },
        qunit: {
            dev: "dist/index.dev.qunit.html",
            concat: "dist/index.concat.qunit.html",
            prod: "dist/index.qunit.html"
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= min.dist.name %>',
                name: 'lib/<%= pkg.name %>.min.js'
            }
        },
        lint: {
            grunt: ['grunt.js'],
            tests: project.tests,
            /* Note that the order of loading the files is important. */
            all: project.scripts
        },
        watch: {
            js: {
                files: '<config:lint.all>',
                tasks: 'lint concat:dist min'
            },
            css: {
                files: 'style/app.scss',
                tasks: 'sass cssmin concat:css'
            },
            html: {
                files: ['index.html', 'tests/qunit.html'],
                tasks: 'html'
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    debugInfo: true,
                    lineNumbers: true,
                    trace: true
                },
                files: {
                    'dist/style/css/app.dev.css': 'style/app.scss'
                }
            },
            prod: {
                options: {
                    // Using compact here, so that debugging is not a nightmare. We minify it later.
                    style: 'compact'
                },
                files: {
                    'dist/style/css/app.concat.css': 'style/app.scss'
                }
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
            },
            grunt: {
                options: {},
                globals: {require: true}
            },
            tests: {
                options: {},
                globals: {module: true, test: true, ok: true, equal: true, deepEqual: true, QUnit: true}
            }
        },
        uglify: {},
        cssmin: {
            css: {
                src: 'dist/style/css/app.concat.css',
                dest: 'dist/style/css/app.min.css'
            }
        }
    });

    grunt.registerHelper('scripts', function(scripts) {
        scripts = Array.isArray(scripts) ? scripts : [scripts];
        return grunt.utils._(scripts).chain().flatten().map(function(script) { return "<script src=\"" + script + "\"></script>\n"; }).value().join("    ");
    });

    grunt.registerHelper('css', function(css) {
        css = Array.isArray(css) ? css : [css];
        return grunt.utils._(css).chain().flatten().map(function(cssFile) { return "<link rel=\"stylesheet\" href=\"" + cssFile + "\">\n"; }).value().join("    ");
    });

    grunt.registerHelper('html', function(content, scripts, css, options) {
        var scriptsTags = grunt.template.process(grunt.helper("scripts", scripts)),
            cssTags = grunt.template.process(grunt.helper("css", css));
        options = options || {};
        return require('ejs').render(content, grunt.utils._.extend(options, {
            scripts: scriptsTags,
            css: cssTags
        }));
    });

    grunt.registerMultiTask('html', 'Generates the index.html file injecting the css and script tags.', function() {
        var fileContents = grunt.task.directive(this.data.src, grunt.file.read);
        var output = grunt.helper("html", fileContents, this.data.js, this.data.css, this.data.options);
        grunt.file.write(this.data.dest, output);
    });

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-css');

    grunt.registerTask('default', 'html lint sass copy concat:dist min cssmin concat:css');
    grunt.registerTask('test', 'copy:tests qunit:dev');

};