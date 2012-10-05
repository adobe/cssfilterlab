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
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<config:lint.all>'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= pkg.name %>.min.js'
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
            files: '<config:lint.files>',
            tasks: 'lint'
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
        uglify: {}
    });

    // Default task.
    grunt.registerTask('default', 'lint concat min');

};