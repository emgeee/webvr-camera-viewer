'use strict'

var gulp = require('gulp')
var browserify = require('browserify')
var watchify = require('watchify')
var browserSync = require('browser-sync').create()

var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var merge = require('merge-stream')
var collapse = require('bundle-collapser/plugin')

var $ = require('gulp-load-plugins')()

function javascript (watch, minify) {
  // allow us to build multiple browserify bundles
  function buildJs (config) {
    var bundler = browserify({
      // Required watchify args
      cache: {},
      packageCache: {},
      fullPaths: watch, // only need fullPaths if we're watching

      // Specify the entry point of your app
      entries: config.entries,

      // Enable source maps!
      debug: true
    })

    if (!watch) {
      bundler.plugin(collapse)
    }

    function bundle () {
      console.log('bundling...')
      var jsStream = bundler
        .bundle()
        .on('error', function (error) {
          console.error('Error building javascript!')
          console.error(error.message)
          this.emit('end')
        })
        .pipe(source(config.outputName))
        .pipe(buffer())
        .pipe($.plumber())
        .pipe($.sourcemaps.init({loadMaps: true}))
          .pipe($.if(minify, $.uglify()))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('./public/scripts'))
        .on('finish', function () {
          console.log('done')
          if (watch) {
            browserSync.reload('./public/scripts/' + config.outputName)
          }
        })

      return jsStream
    }

    if (watch) {
      console.log('Starting watchify...')
      bundler = watchify(bundler)
      bundler.on('update', bundle)
    }

    return bundle()
  }

  // add new bundles here
  return merge([
      {
        entries: ['./src/app.js'],
        outputName: 'app.js'
      }
    ].map(function (c) {
      return buildJs(c)
    }))
}

function copyJs () {
  return gulp.src([
      './src/vendor/*.js'
    ])
    .pipe($.changed('./public/scripts'))
    .pipe(gulp.dest('./public/scripts'))
}

function copyTemplates () {
  return gulp.src('./src/index.html')
    .pipe(gulp.dest('./public'))
}

function css () {
  return gulp.src('./src/main.css')
    .pipe(gulp.dest('./public'))
}

function serve (done) {
  browserSync.init({
    server: {
      baseDir: './public'
    },
    port: 3000,

    open: !!$.util.env.open,
    offline: true,
    notify: false
  }, done)
}

function watch (done) {
  // Enable watchify
  javascript(true, false)

  // reload entire browser
  gulp.watch('./src/index.html', function () {
    copyTemplates().on('end', browserSync.reload)
  })

  gulp.watch('./src/main.css', function () {
    return css().pipe(browserSync.stream())
  })

  done()
}

gulp.task('js', javascript)
gulp.task('css', css)
gulp.task('copyJs', copyJs)
gulp.task('copyTemplates', copyTemplates)
gulp.task('serve', serve)
gulp.task('watch', ['serve', 'css', 'copyJs', 'copyTemplates'], watch)
gulp.task('default', ['watch'])

