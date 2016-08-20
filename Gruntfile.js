'use strict';

module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    function getAwsKeys(){
        if (grunt.file.exists('awsKeys.json')) {
            return grunt.file.readJSON('awsKeys.json');
        }
        return {};
    }

    function getGruntConfig(){
        if (grunt.file.exists('gruntconfig.json')) {
            return grunt.file.readJSON('gruntconfig.json');
        }
        return {
            server : {
                port: 9000,
                hostname: 'localhost'
            }
        };
    }

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist',
        temp_dir: '.tmp'
    };

    var ENV = '', templatePrefix = '';

    function getConstants(isDebug, ENV) {
        var settings = process.env.SETTINGS || ENV;
        var settings_file = '' ;

        if (settings) {
            settings_file = 'constants/local_constants.'+ settings + '.json';
        } else {
            settings_file = 'constants/local_constants.json';
        }
        var constants, local_constants = {};
        if (grunt.file.exists('constants/common_constants.json')) {
            constants = grunt.file.readJSON('constants/common_constants.json');
        }

        if (grunt.file.exists(settings_file)) {
            local_constants = grunt.file.readJSON(settings_file);
        } else {
            grunt.fail.warn("Local constants file not found. Create a local constant file as per Read me.");
        }

        //If template URL's are not defined in local_constants then update the existing ones
        // else update them while processing local constants
        if(!local_constants.hasOwnProperty('templateUrls')){
            templatePrefix = (local_constants.baseTemplatePrefix || "");
            Object.keys(constants.templateUrls).map(function (templateName) {
                constants.templateUrls[templateName] = (local_constants.baseTemplatePrefix || "") + constants.templateUrls[templateName];
            });
        }
        if(!local_constants.hasOwnProperty('images')){
            templatePrefix = (local_constants.baseTemplatePrefix || "");
            Object.keys(constants.images).map(function (templateName) {
                constants.images[templateName] = (local_constants.baseTemplatePrefix || "") + constants.images[templateName];
            });
        }

        for (var attrname in local_constants) {
            //Process template urls for prefix
            templatePrefix = (local_constants.baseTemplatePrefix || "");
            if(attrname === "templateUrls"){
                for (var templateName in local_constants[attrname]){
                    constants[attrname][templateName] = (local_constants.baseTemplatePrefix || "") + local_constants[attrname][templateName];
                }
            }
            else if(attrname === "images"){
                for (var templateName in local_constants[attrname]){
                    constants[attrname][templateName] = (local_constants.baseTemplatePrefix || "") + local_constants[attrname][templateName];
                }
            }
            else if(attrname === "ui_statics"){
                for (var templateName in local_constants[attrname]){
                    constants[attrname][templateName] = (local_constants.baseTemplatePrefix || "") + local_constants[attrname][templateName];
                }
            }
            else{
                constants[attrname] = local_constants[attrname];
            }
        }
        constants.VERSION_NUMBER = parseFloat(grunt.file.read('app/version_file.txt').trim());

        if (isDebug) {
            constants.DEBUG = true;
        }
        return constants;
    }

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        tiesrx: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= tiesrx.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            sass: {
                files: ['<%= tiesrx.app %>/styles/{,*/}*.{scss,sass}', '<%= tiesrx.app %>/styles/partials{,*/}*.{scss,sass}'],
                tasks: ['sass:server']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= tiesrx.app %>/{,**/}*.html',
                    '<%= tiesrx.app %>/styles/{,*/}*.css',
                    '<%= tiesrx.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        gruntConfigParameters: getGruntConfig(),
        // The actual grunt server settings
        connect: {
            options: {
                port: '<%= gruntConfigParameters.server.port %>',
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '<%= gruntConfigParameters.server.hostname %>',
                // Do not change this port value, changing this may cause annomalies
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect().use(
                                '/app/styles',
                                connect.static('./app/styles')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= tiesrx.dist %>'
                }
            }
        },

        constant: getConstants(true),
        constantDev: getConstants(true, 'dev'),
        constantQA: getConstants(true, 'qa'),

        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                wrap: '//DO NOT EDIT THIS. USE constants/local_constants.json INSTEAD.\n"use strict";\n\n {%= __ngModule %}',
                name: 'PROJECT_CONSTANTS',
                dest: '<%= tiesrx.app %>/scripts/constants.js'
            },
            dist: {
                constants: {
                    PROJECT_CONSTANTS: '<%= constant %>'
                }
            },
            dev: {
                constants: {
                    PROJECT_CONSTANTS: '<%= constantDev %>'
                }
            },
            qa: {
                constants: {
                    PROJECT_CONSTANTS: '<%= constantQA %>'
                }
            }
        },
        // Make sure there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= tiesrx.app %>/scripts/{,*/}*.js',
                    '!<%= tiesrx.app %>/scripts/libs/**/*.js'
                ]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= tiesrx.dist %>/{,*/}*',
                        '!<%= tiesrx.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= tiesrx.app %>/index.html'],
                ignorePath: /\.\.\//
            },
            sass: {
                src: ['<%= tiesrx.app %>/styles/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                sourceMap: false,
                outputStyle: 'compressed'
            },
            server: {
                files: {
                    '<%= tiesrx.app %>/styles/styles.css': '<%= tiesrx.app %>/styles/styles.scss'
                }
            },
            dist: {
                files: {
                    '.tmp/styles/styles.css': '<%= tiesrx.app %>/styles/styles.scss'
                }
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= tiesrx.dist %>/scripts/{,*/}*.js',
                    '<%= tiesrx.dist %>/styles/{,*/}*.css'
//                    '<%= tiesrx.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
//                    '<%= tiesrx.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= tiesrx.app %>/index.html',
            options: {
                dest: '<%= tiesrx.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= tiesrx.dist %>/{,*/}*.html'],
            css: ['<%= tiesrx.dist %>/styles/{,*/}*.css'],
            js: ['<%= tiesrx.dist %>/scripts/{,*/}*.js'],
            options: {
                assetsDirs: [
                    '<%= tiesrx.dist %>',
                    '<%= tiesrx.dist %>/images',
                    '<%= tiesrx.dist %>/styles'
                ],
                patterns: {
                    js: [
                        [/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']
                    ]
                }
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= tiesrx.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= tiesrx.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= tiesrx.dist %>',
                    src: ['*.html'],
                    dest: '<%= tiesrx.dist %>'
                }]
            }
        },

        cdnify: {
            dev: {
                options: {
                    base: '<%= constantDev.baseTemplatePrefix %>',
                    cc: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['version_file.txt', 'index.html', 'root/index.html'],
                    dest: 'dist'
                }]
            },
            qa: {
                options: {
                    base: '<%= constantQA.baseTemplatePrefix %>',
                    cc: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['version_file.txt', 'index.html', 'root/index.html'],
                    dest: 'dist'
                }]
            }
        },

        ngtemplates: {
            dist: {
                options: {
                    module: 'TIESRx',
                    htmlmin: '<%= htmlmin.dist.options %>',
                    usemin: 'scripts/scripts.js'
                },
                cwd: '<%= tiesrx.app %>',
                src: 'views/{,*/}*.html',
                dest: '.tmp/templateCache.js'
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= tiesrx.app %>',
                    dest: '<%= tiesrx.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '*.html',
                        'views/**',
                        'images/{,*/}*.*',
                        'fonts/{,*/}*.*'
                    ]
                },{
                    expand: true,
                    dot: true,
                    cwd: '<%= tiesrx.app %>',
                    dest: '<%= tiesrx.dist %>/root',
                    src: [
                        'index.html',
                        'version_file.txt'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= tiesrx.dist %>/images',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= tiesrx.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        files_to_deploy: [
            {
                src: ['**/*.*'],//, '!index.html'
                dest: 'PROJECT/',
                cwd: './<%= tiesrx.dist %>/',
                expand:true
            }
        ],
        // read AWS specific settings
        aws: getAwsKeys(),

        aws_s3: {
            options: {
                region: 'us-east-1',
                access: 'public-read',
                progress: 'progressBar',
                accessKeyId: '<%= aws.AWSAccessKeyId %>',
                secretAccessKey: '<%= aws.AWSSecretKey %>',
                params: {
                    ContentEncoding: 'gzip'
                },
                //differential: true ,
                gzip: true
            },
            deploy_dev: {
                options: {
                    bucket: '<%= aws.AWSBucketDev %>'
                },
                files: '<%=files_to_deploy%>'
            },
            deploy_qa: {
                options: {
                    bucket: '<%= aws.AWSBucketQA %>'
                },
                files: '<%=files_to_deploy%>'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'sass:server'
            ],
            dist: [
                'sass:dist'
            ]
        },
        invalidate_cloudfront: {
            options: {
                key: '<%= aws.AWSAccessKeyId %>',
                secret: '<%= aws.AWSSecretKey %>',
                distribution: '<%= aws.cloudFrontDistributionID %>'
            },
            rootFiles_dev:{
                options: {
                    distribution: '<%= aws.cloudFrontDistributionIDDev %>'
                },
                files: [
                    {
                        expand: true,
                        cwd: './<%= tiesrx.dist %>/root',
                        src: '**/*',
                        dest: 'PROJECT/'
                    },
                    {
                        dest: 'PROJECT/'
                    }
                ]
            },
            rootFiles_qa:{
                options: {
                    distribution: '<%= aws.cloudFrontDistributionIDQA %>'
                },
                files: [
                    {
                        expand: true,
                        cwd: './<%= tiesrx.dist %>/root',
                        src: '**/*',
                        dest: 'PROJECT/'
                    },
                    {
                        dest: 'PROJECT/'
                    }
                ]
            }
        }

    });

    grunt.registerTask('deploy', 'Deploys the code to s3', function (target) {
        grunt.task.run(['build:' + target, 'cdnify:' + target, 'aws_s3:deploy_' + target, 'clearCloudfrontCache:rootFiles_' + target]);
    });
//    grunt.registerTask('cdn', 'testing', function () {
//        grunt.task.run(['build', 'cdnify']);
//    });

    grunt.registerTask('clearCloudfrontCache', 'Clears Cloud front cache', function (target) {
        var awsKeys = grunt.config.get('aws');
        if (target === 'rootFiles_dev'){
            if (!awsKeys.cloudFrontDistributionIDDev){
                console.log("Configure cloudFrontDistributionIDDEv in awsKeys.json");
                return;
            }
            console.log("Clearing all Cache for Dev");
            return grunt.task.run('invalidate_cloudfront:rootFiles_dev');
        }
        if (target === 'rootFiles_qa'){
            if (!awsKeys.cloudFrontDistributionIDQA){
                console.log("Configure cloudFrontDistributionIDQA in awsKeys.json");
                return;
            }
            console.log("Clearing all Cache for QA");
            return grunt.task.run('invalidate_cloudfront:rootFiles_qa');
        }
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'ngconstant:dist',
            'wiredep',
            'concurrent:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('build', function(target){
        console.log(target);
        grunt.task.run(
            [
                'clean:dist',
                'ngconstant:' + target || 'dist',
                'wiredep',
                'useminPrepare',
                'concurrent:dist',
                'concat',
                'ngAnnotate',
                'copy:dist',
                'cssmin',
                'uglify',
                'filerev',
                'usemin',
                'htmlmin'
            ]
        )
    });

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
