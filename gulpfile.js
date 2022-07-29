const gulp = require('gulp');

const {
	src,
	dest
} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync');

// For live-reloading
const reload = browserSync.reload;

// Compile scss
gulp.task('compiler', function() {
    return src('src/scss/**/*.scss',)
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(concat('style.min.css'))
        .pipe(dest('src/'))
});

// Starting live-reload server
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './src'
        },
        open: true,
        notify: true
    })
});

// For recompilation
gulp.task('watch', function() {
    gulp.watch('src/**/*.scss', gulp.series('default')).on('change', reload),
    gulp.watch('src/*.html', gulp.series('default')).on('change', reload);
    gulp.watch('./src/img/*', gulp.series("copy")).on("change", reload);
});

// Copy img folder from ~ to build
gulp.task('copy', function() {
    return gulp.src('./src/img/**')
        .pipe(gulp.dest('./build/img'));
});

// The default task
gulp.task('default', 
    gulp.series("compiler"), function (done) {
        done();
    }
);

// For developer
gulp.task('dev', 
    gulp.series("copy", gulp.parallel("default", "watch", "browserSync" ), function (done) {
        done();
    })
);