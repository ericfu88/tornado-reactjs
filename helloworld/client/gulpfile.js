var gulp = require('gulp');
var watch = require('gulp-watch');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify'); 
var gulpif = require('gulp-if');
var del = require('del');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var htmlreplace = require('gulp-html-replace');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var glob = require('glob');
var livereload = require('gulp-livereload');
var jasminePhantomJs = require('gulp-jasmine2-phantomjs');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
	'react',
  'react-addons'
];

var browserifyTask = function (options) {

  // Our app bundler
	var appBundler = browserify({
		entries: [options.src], // Only need initial file, browserify finds the rest
   	transform: [reactify], // We want to convert JSX to normal javascript
		debug: options.development, // Gives us sourcemapping
		cache: {}, packageCache: {}, fullPaths: options.development // Requirement of watchify
	});

	// We set our dependencies as externals on our app bundler when developing		
	(options.development ? dependencies : []).forEach(function (dep) {
		appBundler.external(dep);
	});

  // The rebundle process
  var rebundle = function () {
    var start = Date.now();
    console.log('Building APP bundle');
    appBundler.bundle()
      .on('error', gutil.log)
      .pipe(source(options.dest_file))
      .pipe(gulpif(!options.development, streamify(uglify())))
      .pipe(gulp.dest(options.dest))
      .pipe(gulpif(options.development, livereload()))
      .pipe(notify(function () {
        console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
      }));
  };

  // Fire up Watchify when developing
  if (options.development) {
    appBundler = watchify(appBundler);
    appBundler.on('update', rebundle);
  }
      
  rebundle();  
}

var testBundlerTask = function(options) {
  // We create a separate bundle for our dependencies as they
  // should not rebundle on file changes. This only happens when
  // we develop. When deploying the dependencies will be included 
  // in the application bundle
  var testFiles = glob.sync(options.test_specs);
  var testBundler = browserify({
    entries: testFiles,
    debug: true, // Gives us sourcemapping
    transform: [reactify],
    cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
  });

  dependencies.forEach(function (dep) {
    testBundler.external(dep);
  });

  var rebundleTests = function () {
    var start = Date.now();
    console.log('Building TEST bundle');
    testBundler.bundle()
    .on('error', gutil.log)
      .pipe(source('specs.js'))
      .pipe(gulp.dest(options.testing_dest))
      .pipe(livereload())
      .pipe(notify(function () {
        console.log('TEST bundle built in ' + (Date.now() - start) + 'ms');
      }));
  };

  testBundler = watchify(testBundler);
  testBundler.on('update', rebundleTests);
  rebundleTests();

  var vendorsBundler = browserify({
    debug: true,
    require: dependencies
  });
  
  // Run the vendor bundle
  var start = new Date();
  console.log('Building VENDORS bundle');
  vendorsBundler.bundle()
    .on('error', gutil.log)
    .pipe(source('vendors.js'))
    .pipe(gulpif(!options.development, streamify(uglify())))
    .pipe(gulp.dest(options.vendor_js_dest))
    .pipe(notify(function () {
      console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
    }));
}


var cssTask = function (options) {
    if (options.development) {
      var run = function () {
        console.log(arguments);
        var start = new Date();
        console.log('Building CSS bundle');
        gulp.src(options.src)
          .pipe(concat('main.css'))
          .pipe(gulp.dest(options.dest))
          .pipe(notify(function () {
            console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
          }));
      };
      run();
      gulp.watch(options.src, run);
    } else {
      gulp.src(options.src)
        .pipe(concat('main.css'))
        .pipe(cssmin())
        .pipe(gulp.dest(options.dest));   
    }
}

var scssTask = function (options) {
    if (options.development) {
      var run = function () {
        console.log(arguments);
        var start = new Date();
        console.log('Building SCSS bundle');
        gulp.src(options.src)
          .pipe(sass())
          .pipe(concat('main.css'))
          .pipe(gulp.dest(options.dest))
          .pipe(notify(function () {
            console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
          }));
      };
      run();
      gulp.watch(options.src, run);
    } else {
      gulp.src(options.src)
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(cssmin())
        .pipe(gulp.dest(options.dest));   
    }
}

var watchCopyTask = function(options) {
  var copyTemplates = function() {
        gulp.src(options.src)
            .pipe(gulp.dest(options.dest));    
  }

  copyTemplates();
  watch(options.src, function () {
        copyTemplates();
    });
}


var getFileNameFromPath = function(filePath) {
  return filePath.substring(filePath.lastIndexOf('/') + 1)
}

/**
 * Development work flow
 */
gulp.task('default', function () {
  var appRootFiles = glob.sync('./src/app/app_*.js');
  appRootFiles.forEach(function (appFile) {
    browserifyTask({
      development: true,
      src: appFile,
      dest: './build/static/js',
      dest_file: getFileNameFromPath(appFile)
    });
  });

  testBundlerTask({
    test_specs: './testing/specs/**/*-spec.js',    
    testing_dest: './testing/build',   
    vendor_js_dest: './build/static/js',    
  })

  /*
   * Enable this when not using scss but pure css only.
  cssTask({
    development: true,
    src: './src/css/*.css',
    dest: './build/static/css'
  });
  */

  scssTask({
    development: true,
    src: './src/scss/*.scss',
    dest: './build/static/css'
  });  

  watchCopyTask({
    src: './src/templates/*.html',
    dest: './build/templates'    
  })

});


/**
 * Build for deployment
 */
gulp.task('deploy', function () {

  var appRootFiles = glob.sync('./src/app/app_*.js');
  appRootFiles.forEach(function (appFile) {
    browserifyTask({
      development: false,
      src: appFile,
      dest: './dist/static/js',
      dest_file: getFileNameFromPath(appFile)
    });
  });

  /*
  * Enable this when not using scss but pure css only.
  cssTask({
    development: false,
    src: './src/css/*.css',
    dest: './dist/static/css'
  });
  */
  scssTask({
    development: false,
    src: './src/scss/*.scss',
    dest: './dist/static/css'
  }); 

  console.log('Copy and transform template files');
  gulp.src('src/templates/*.html')
      .pipe(htmlreplace({debugOnly: ''}))
      .pipe(gulp.dest('dist/templates'));
});

gulp.task('test', function () {
    return gulp.src('./testing/build/testrunner-phantomjs.html').pipe(jasminePhantomJs());
});

gulp.task('clean', function () {
  del([
      './build/**',
      './dist/**',
      'testing/build/specs.js*',
      './TEST-App.xml'
    ]);                 
});

