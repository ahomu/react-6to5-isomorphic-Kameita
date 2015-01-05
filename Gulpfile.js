var gulp     = require('gulp');
var plumber  = require('gulp-plumber');
var sequence = require('run-sequence').use(gulp);
var rimraf   = require('rimraf');
var package  = require('./package.json');
var banner   = '/*! <%= name %> - v<%= version %> */'
var lazypipe = require('lazypipe');

var GLOB_SERVER_SRC        = './src/server/**/*.js';
var DIR_SERVER_RUNNABLE    = './dist/server-compiled';

var GLOB_CLIENT_SRC        = './src/client/**/*.js';
var DIR_CLIENT             = './src/client';
var DIR_CLIENT_PUBLIC      = './dist/client-public';

/**
 * Flow type
 */
gulp.task('flow:client', function() {
  var flow  = require('gulp-flowtype');

  return gulp.src(GLOB_CLIENT_SRC)
    .pipe(plumber())
    .pipe(flow({
      all: false,
      weak: false,
      declarations: './declarations',
      killFlow: false,
      beep: true
    }));
});

gulp.task('flow:server', function() {
  var flow  = require('gulp-flowtype');

  return gulp.src(GLOB_SERVER_SRC)
    .pipe(plumber())
    .pipe(flow({
      all: false,
      weak: false,
      declarations: './declarations',
      killFlow: false,
      beep: true
    }));
});

/**
 * Compile ES6 -> ES5.1
 */
gulp.task('compile:client', function() {
  var uglify     = require('gulp-uglify');
  var rename     = require('gulp-rename');
  var header     = require('gulp-header');
  var exportName = package.name.replace('-', '');
  var fileName   = package.name.toLocaleLowerCase();

  return gulp.src(DIR_CLIENT + '/index.js')
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

gulp.task('compile:server', function() {
  var to5     = require('gulp-6to5');

  return gulp.src(GLOB_SERVER_SRC)
    .pipe(to5({
      experimental : false,
      runtime      : true
    }))
    .pipe(gulp.dest(DIR_SERVER_RUNNABLE));
});

/**
 * Build & Watch
 */
gulp.task('build', function() {
  gulp.start('build:client', 'build:server');
});

gulp.task('build:client', function() {
  gulp.start('flow:client', 'compile:client');
});

gulp.task('build:server', function() {
  gulp.start('flow:server', 'compile:server');
});

gulp.task('watch', function() {

  gulp.watch(GLOB_CLIENT_SRC, function() {
    gulp.start('build:client');
  });

  gulp.watch(GLOB_SERVER_SRC, function() {
    gulp.start('build:server');
  });

});

/**
 * Utilities
 */
gulp.task('flowconfig:update', function(done) {
  var fs = require('fs');
  var dependencies = Object.keys(package.devDependencies);
  var ignorePaths = dependencies.map(function(d) {
    return '.*/node_modules/' + d + '/.*'
  });

  fs.readFile('./flowconfig.tmpl', {encoding: 'utf8'}, function (err, data) {
    if (err) {
      throw err;
    }
    var content = data.replace('{% devDependencies %}', ignorePaths.join('\n'));
    fs.writeFile('./.flowconfig', content, done);
  });
});

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
        require.resolve('6to5/browser-polyfill'),
        require.resolve('react/react')]
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
