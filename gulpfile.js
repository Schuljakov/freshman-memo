import gulp from 'gulp';
import fs from 'fs';

import pug from 'gulp-pug';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import csso from 'gulp-csso';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify-es';
import imagemin  from 'gulp-imagemin';
import imagemin_webp from 'imagemin-webp';
import concat from 'gulp-concat';
import cleanCss from 'gulp-clean-css';
import plumber from 'gulp-plumber';
import gcmq from 'gulp-group-css-media-queries';
import browserSync from 'browser-sync';
import path from 'path';

const sass = gulpSass(dartSass);
const data = {};

export const json = async () => {
  try {
    const modules = fs.readdirSync('src/data/');
    modules.forEach(json => {
        const name = path.basename(json, path.extname(json));
        const file = path.join('./src/data', json);
        return data[name] = JSON.parse(fs.readFileSync(file));
    });
  }
  catch(exception) {
    console.log(exception);
  }
}

export const pug2html = () => {
    return gulp.src('src/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            locals: { data : data }
        }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());
}

export const collectComponentsSCSS = () => {
    return gulp.src([
      'src/components/**/*.scss',
      '!src/components/**/_media.scss',
      '!src/components/**/_components.scss'])
        .pipe(concat('_components.scss'))
        .pipe(gulp.dest('src/components'));
}

export const collectComponentMediaSCSS = () => {
    return gulp.src(['src/components/**/_media.scss', '!src/components/_media.scss'])
        .pipe(gcmq())
        .pipe(concat('_media.scss'))
        .pipe(gulp.dest('src/components'));
}

export const styles = () => {
    return gulp.src('src/scss/style.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 12 version'],
            grid: true
        }))
        .pipe(csso())
        .pipe(cleanCss({compatibility: 'ie8', level: 2}))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
}

export const scripts = () => {
    return gulp.src([
        'src/components/**/*.js',
        'src/js/main.js'
    ])
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream());
}

export const browsersync = () => {
    browserSync.create().init({
        server: {
            baseDir: 'build/'
        },
        files: [
          "build/css/*.css",
          "build/js/*.js",
          "build/*.html"
        ],
        open: false,
        notify: false,
    });
}

export const imageBuild = () => {
    return gulp.src(['src/images/**/*', 'src/components/**/*'])
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 80, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest('build/images'));
}

export const imagesConvertToWebp = () => {
    return gulp.src(['build/images/*.{jpg, jpeg, png}'])
        .pipe(imagemin_webp({
            quality: 80
        }))
        .pipe(gulp.dest("build/images"));
}

export const watching = () => {
    gulp.watch(['src/pages/*.pug'], pug2html);
    gulp.watch('src/data/*.json', gulp.series(json, pug2html));
    gulp.watch([
      'src/components/**/*.scss',
      '!src/components/**/_media.scss',
      '!src/components/**/_components.scss'], gulp.series(collectComponentsSCSS, styles));
    gulp.watch(['src/components/**/_media.scss', '!src/components/_media.scss'], gulp.series(collectComponentMediaSCSS, styles));
    gulp.watch(['src/scss/**/*.scss'], styles);
    gulp.watch(['src/components/**/*.js', 'src/js/main.js'], scripts);
    gulp.watch(['src/images/*.*', 'src/components/**/*.{jpg, jpeg, png, svg, gif}'], gulp.series(imageBuild, imagesConvertToWebp));
}


export const startGulp = gulp.series(json, pug2html, collectComponentsSCSS, collectComponentMediaSCSS, styles, scripts);
export const buildImages = gulp.series(imagemin);
export const run = gulp.parallel(json, browsersync, watching);

