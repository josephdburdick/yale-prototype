'use strict';

var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    path        = require('path'),
    fileinclude = require('gulp-file-include'),
    $           = require('gulp-load-plugins')();


var paths = {
  templates: './app'
};
 
gulp.task('fileinclude', function() {
  return gulp.src(path.join(paths.templates, '*.tpl.html'))
    .pipe(fileinclude())
    .pipe($.rename({
      extname: ""
    }))
    .pipe($.rename({
      extname: ".html"
    }))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('./'))
    .pipe($.size());
});

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber(function(error) {
      gutil.beep();
      gutil.log(gutil.colors.red(error.message));
      this.emit('end');
    }))
    .pipe($.rubySass({
        lineNumbers: true,
        style: 'expanded', //compact, compressed
        precision: 10
    }))
    .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size());
});

gulp.task('scripts', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber(function(error) {
      gutil.beep();
      gutil.log(gutil.colors.red(error.message));
      this.emit('end');
    }))
    .pipe($.jshint())
    .pipe($.jshint.reporter(require('jshint-stylish')))
    .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src('app/*.html')
    .pipe($.plumber(function(error) {
      gutil.beep();
      gutil.log(gutil.colors.red(error.message));
      this.emit('end');
    }))
    .pipe(fileinclude())
    .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('extras', function () {
  return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['fileinclude','html', 'images', 'fonts', 'styles', 'extras']);

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('connect', function () {
  gulp.task('fileinclude',function(){
    var connect = require('connect');
    var app = connect()
      .use(require('connect-livereload')({ port: 35729 }))
      .use(connect.static('app'))
      .use(connect.static('.tmp'))
      .use(connect.directory('app'));

    require('http').createServer(app)
      .listen(9000)
      .on('listening', function () {
          console.log('Started connect web server on http://localhost:9000');
      });  
  })
  
});

gulp.task('serve', ['connect', 'fileinclude', 'styles'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
        directory: 'app/bower_components'
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
        directory: 'app/bower_components',
        exclude: ['bootstrap-sass-official', 'font-awesome', 'holderjs', 'modernizr']
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
  var server = $.livereload();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', function (file) {
      server.changed(file.path);
  });
  gulp.watch('app/**.tpl.html', ['fileinclude']);
  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});
