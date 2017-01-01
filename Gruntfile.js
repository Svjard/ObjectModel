const gzipSize = require('gzip-size').sync;

module.exports = function(grunt) {

	function esc(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	const pkg  = grunt.file.readJSON('package.json');
	const BANNER = "// ObjectModel v" + pkg.version + " - " + pkg.homepage + "\n";

	const srcFiles = [
		'src/constants.js',
		'src/helpers.js',
		'src/model.js',
		'src/object-model.js',
		'src/array-model.js',
		'src/function-model.js',
		'src/map-model.js',
		'src/set-model.js'
	];

	// Project configuration.
	grunt.initConfig({
		pkg: pkg,
		concat: {
			dist: {
				src: srcFiles,
				dest: 'dist/object-model.js',
				options: {
					banner: BANNER + ";(function(global){\n",
					footer: "\n\nglobal.Model = Model;\n})(this);"
				}
			}
		},
		babel: {
			dist: {
				options: {
					sourceMap: true,
					presets: [require('babel-preset-babili')],
					compact: true,
					minified: true,
					comments: false
				},
				files: {
					'dist/object-model.min.js': 'dist/object-model.js'
				}
			}
		},
		rollup: {
			dist: {
				options: {
					format: "iife",
					moduleName: "Model"
				},
				files: {
					'dist/object-model.js': ['src/main.js'] // Only one source file is permitted
				}
			}
		},
		watch: {
			scripts: {
				files: ['src/**.js','lib/**.js','test/**.js'],
				tasks: ['dist'],
				options: {
					spawn: false
				}
			}
		},
		qunit: {
			dist: {
				src: ['test/index.html']
			}
		},
		file_info: {
			dist: {
				src: ['dist/object-model.js','dist/object-model.min.js'],
				options: {
					stdout: false,
					inject: [
						{
							dest: 'index.html',
							text: 'all in <strong>{{= sizeText(size(src[1])) }} minified, {{= sizeText(gzipSize(src[1])) }} gzipped</strong>'
						},
						{
							dest: 'index.html',
							text: 'Minified file ({{= sizeText(size(src[1])) }}, {{= sizeText(gzipSize(src[1])) }} gzipped)'
						}
					]
				}
			}
		},
		"regex-replace": {
			site: { //specify a target with any name
				src: ['index.html'],
				actions: [
					{
						name: 'version number',
						search: esc('Current version: v')+'\\d+\\.\\d+\\.\\d+',
						replace: 'Current version: v'+pkg.version
					},{
						name: 'zip url',
						search: esc('<a href="https://github.com/sylvainpolletvillard/ObjectModel/archive/v')
						+'\\d+\\.\\d+\\.\\d+'+esc('.zip">object-model-')+'\\d+\\.\\d+\\.\\d+'+esc('.zip</a>'),
						replace: '<a href="https://github.com/sylvainpolletvillard/ObjectModel/archive/v'
						+pkg.version+'.zip">object-model-'+pkg.version+'.zip</a>'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-file-info');
	grunt.loadNpmTasks('grunt-regex-replace');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-rollup');

	grunt.registerTask('dist', ['rollup:dist','babel:dist','file_info:dist','regex-replace:site']);
	grunt.registerTask('test', ['qunit:dist']);
	grunt.registerTask('default', ['dist','test']);

};