const gulp = require('gulp');

const {
	src,
	dest
} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const fileinclude = require('gulp-file-include');


// For live-reloading
const reload = browserSync.reload;

// Compile scss
gulp.task('compiler', function() {
    return src('src/scss/**/*.scss',)
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(dest('./build/'))
});
 
// Starting live-reload server
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './build'
        },
        open: true,
        notify: true
    })
});

// For recompilation
gulp.task('watch', function() {
    gulp.watch('src/**/*.scss', gulp.series('default')).on('change', reload),
    gulp.watch('src/**.html', gulp.series('htmlCopy')).on('change', reload);
    gulp.watch('./src/img/**', gulp.series("imageCopy")).on("change", reload);
});

// Copy img folder from ~ to build
gulp.task('imageCopy', function() {
    return gulp.src('./src/img/**')
        .pipe(gulp.dest('./build/img'));
});

// Copy index.html folder from ~ to build
gulp.task('htmlCopy', function() {
    return gulp.src('./src/**.html')
        .pipe(gulp.dest('./build/'));
});

// File include
gulp.task('fileinclude', async function() {
    gulp.src(['./src/*.html'])
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest('./build/'));
  });

// The default task
gulp.task('default', 
    gulp.series("compiler", 'imageCopy', 'htmlCopy'), function (done) {
        done();
    }
);

// For developer
gulp.task('dev', 
    gulp.series(gulp.parallel("default", "watch", "browserSync"), function (done) {
        done();
    })
);