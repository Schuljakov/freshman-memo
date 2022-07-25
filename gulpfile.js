// const gulp = require('gulp');

// const {
// 	src,
// 	dest
// } = require('gulp');
// const sass = require('gulp-sass')(require('sass'));
// const concat = require('gulp-concat');
// const browserSync = require('browser-sync');
// const pump = require('pump');

// // For live-reloding
// const reload = browserSync.reload;

// // Compile scss
// gulp.task('compiler', function() {
//     return src('src/scss/**/*.scss',)
//         .pipe(sass({
//             outputStyle: 'expanded'
//         }).on('error', sass.logError))
//         .pipe(concat('style.min.css'))
//         .pipe(dest('dist/'))
// });

// // Starting live-reload server
// gulp.task('browserSync', function() {
//     browserSync.init({
//         server: {
//             baseDir: './src',
//             index: "./index.html",
//             startPath: "./index.html"
//         },
//         open: false,
//         notify: true
//     })
// });

// // For recompilation
// gulp.task('watch', function() {
//     gulp.watch('src/**/*.scss', gulp.series('default')).on('change', reload),
//     gulp.watch('src/*.html', gulp.series('default')).on('change', reload);
// });

// //Updating html
// gulp.task("html", function(cb) {
//     pump([
//         gulp.src('src/index.html'),
//         gulp.dest('dist/'),
//     ], cb)
// });

// // The default task
// gulp.task('default', 
//     gulp.series("compiler", "html"), function (done) {
//         done();
//     }
// );

// gulp.task('image', function() {
//     gulp.watch('*.{png,jpg,jpeg,gif,svg}', function() {
//       gulp.src('*.{png,jpg,jpeg,gif,svg}')
//         .pipe(image())
//         .pipe(gulp.dest('./img'));
//     });
//   });

// // For developer
// gulp.task('dev', 
//     gulp.series(gulp.parallel("default", "watch", "browserSync", "image"), function (done) {
//         done();
//     })
// );


const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const pump = require('pump');
const browserSync = require('browser-sync');

// потребуется для оповещения о изменении live-reload сервера
const reload = browserSync.reload;

// задание запускает live-reload сервер
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: './dist'
        },
        open: false,
        notify: false
    })
});

// компиляции стилей scss -> css
gulp.task('style', function(cb) {
    pump([
        gulp.src('src/scss/*.scss'),
        sass().on('error', sass.logError),
        gulp.dest('dist/'),
        reload({stream: true})
    ], cb)
});

// просто копирование из папки src в папку dist
gulp.task('html', function(cb) {
    pump([
        gulp.src('src/index.html'),
        gulp.dest('dist/'),
        reload({stream: true})
    ], cb);
});

// задание для перекомпиляции при изменении
gulp.task('watch', function() {
    gulp.watch('src/scss/*.scss', gulp.series('style'));
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch('**/*.png', gulp.series('default'))
});

// основная gulp задание, которое запускается через gulp
gulp.task('default', gulp.series(gulp.parallel('style', 'html')));

// запуск live-reload сервера с отслеживанием изменений
gulp.task('dev',
    gulp.series(gulp.parallel("default", "watch", "browserSync"), function (done) {
        done();
    })
);