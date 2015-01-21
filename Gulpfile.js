var gulp     = require('gulp');
var plumber  = require('gulp-plumber');
var filter   = require('gulp-filter');
var package  = require('./package.json');
var banner   = '/*! <%= name %> - v<%= version %> */';

var GLOB_SERVER_SRC        = './src/server/**/*';
var DIR_SERVER_COMPILED    = './dist/server';

var GLOB_COMPONENTS_SRC     = './src/components/**/*';
var DIR_COMPONENTS_COMPILED = './dist/components';

var GLOB_CLIENT_SRC        = './src/client/**/*';
var DIR_CLIENT_PUBLIC      = './dist/client';

var FILE_BROWSERIFY_INDEX  = './src/client/index.js';

/**
 * Compile ES6 -> ES5.1
 */
gulp.task('compile:client', function() {
  var uglify     = require('gulp-uglify');
  var rename     = require('gulp-rename');
  var header     = require('gulp-header');
  var exportName = package.name.replace('-', '');
  var fileName   = package.name.toLocaleLowerCase();

  return gulp.src(FILE_BROWSERIFY_INDEX)
    .pipe(bufferedBrowserify(exportName))
    .pipe(header(banner, {name: fileName, version: package.version}))
    .pipe(rename(fileName + '.js'))
    .pipe(gulp.dest(DIR_CLIENT_PUBLIC))
    .pipe(plumber())
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename(fileName + '.min.js'))
    .pipe(gulp.dest(DIR_CLIENT_PUBLIC))
});

gulp.task('compile:components', function() {
  var to5     = require('gulp-6to5');
  var jsFilter = filter('**/*.js');

  return gulp.src(GLOB_COMPONENTS_SRC)
    .pipe(jsFilter)
    .pipe(plumber())
    .pipe(to5({
      experimental : false,
      runtime      : true
    }))
    .pipe(jsFilter.restore())
    .pipe(gulp.dest(DIR_COMPONENTS_COMPILED));
});

gulp.task('compile:server', function() {
  var to5     = require('gulp-6to5');
  var jsFilter = filter('**/*.js');

  return gulp.src(GLOB_SERVER_SRC)
    .pipe(jsFilter)
    .pipe(plumber())
    .pipe(to5({
      experimental : false,
      runtime      : true
    }))
    .pipe(jsFilter.restore())
    .pipe(gulp.dest(DIR_SERVER_COMPILED));
});

/**
 * Build & Watch
 */
gulp.task('build', function() {
  gulp.start('build:client', 'build:server');
});

gulp.task('build:client', function() {
  gulp.start('compile:client');
});

gulp.task('build:server', function() {
  gulp.start('compile:server', 'compile:components');
});

gulp.task('watch', function() {

  gulp.watch(GLOB_CLIENT_SRC, function() {
    gulp.start('build:client');
  });

  gulp.watch(GLOB_SERVER_SRC, function() {
    gulp.start('build:server');
  });

  gulp.watch(GLOB_COMPONENTS_SRC, function() {
    gulp.start('build:server', 'build:client');
  });

});

/**
 * Utilities
 */
gulp.task('pretest', function() {
  gulp.start('build:client', 'build:test-client');
});


function bufferedBrowserify(standaloneName) {
  var transform  = require('vinyl-transform');
  var browserify = require('browserify');
  var to5ify     = require('6to5ify');

  return transform(function(filename) {
    return browserify(filename, {
        standalone : standaloneName,
        debug      : true,
        noParse    : [
          require.resolve('6to5/runtime'),
          require.resolve('6to5/browser-polyfill')
        ]
      })
      .transform(to5ify.configure({
        experimental : false,
        runtime      : true
      }))
      .bundle()
      .on('error', function(err){
        console.error(err.message);
        this.emit('end');
      })
      ;
  });
}
