import gulp from 'gulp';
import src from 'gulp';
import dest from 'gulp';
import fs from 'fs';

import pug from 'gulp-pug';
import scss from 'gulp-sass';
import csso from 'gulp-csso';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify-es';
import imagemin  from 'gulp-imagemin';
import concat from 'gulp-concat';
import del from 'del';
import cleanCss from 'gulp-clean-css';
import plumber from 'gulp-plumber';
import gcmq from 'gulp-group-css-media-queries';
import browserSync from 'browser-sync';
import path from 'path';

const data = {};

// const { src, dest, watch, parallel, series} = require('gulp');
// const fs = require('fs');

// const pug          = require('gulp-pug');
// const scss         = require('gulp-sass')(require('sass'));
// const csso         = require('gulp-csso');
// const autoprefixer = require('gulp-autoprefixer');
// const uglify       = require('gulp-uglify-es').default;
// const imagemin     = require('gulp-imagemin');

// const concat       = require('gulp-concat');
// const del          = require('del');
// const cleanCss     = require('gulp-clean-css');
// const plumber      = require('gulp-plumber');
// const gcmq         = require('gulp-group-css-media-queries');

// const browserSync  = require('browser-sync').create();
// const path         = require('path');
// const data         = {};

export const json = () => {
    try {
        const modules = fs.readdirSync('src/data/');
        modules.forEach(json => {
            const name = path.basename(json, path.extname(json));
            const file = path.join('./src/data', json);
            return data[name] = JSON.parse(fs.readFileSync(file));
        })
    } catch(e) {
        console.log(e);
    }
}

export const pug2html = () => {
    return src('src/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            locals: { data : data }
        }))
        .pipe(dest('build'))
        .pipe(browserSync.stream());
}

export const collectComponentsSCSS = () => {
    return src('src/components/**/*.scss')
        .pipe(concat('_components.scss'))
        .pipe(dest('src/components'));
}

export const collectComponentMediaSCSS = () => {
    return src('src/components/**/media.scss')
        .pipe(gcmq())
        .pipe(concat('_media.scss'))
        .pipe(dest('src/components'));
}

export const styles = () => {
    return src('src/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 12 version'],
            grid: true
        }))
        .pipe(csso())
        .pipe(cleanCss({compatibility: 'ie8', level: 2}))
        .pipe(dest('build/css'))
        .pipe(browserSync.stream());
}

export const scripts = () => {
    return src([
        'src/components/**/*.js',
        'src/js/main.js'
    ])
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(dest('build/js'))
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
    return src(['src/images/**/*', 'src/components/**/*'])
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
        .pipe(dest('build/images'));
}

// function imagesConvert() {
//     return src(['build/images/*.{jpg, jpeg, png}'])
//         .pipe(imageminWebp({
//             quality: 80
//         }))
//         .pipe(dest("build/images"));
// }

export const watching = () => {
    gulp.watch(['src/pages/*.pug'], pug2html);
    gulp.watch('src/data/*.json', json, pug2html);
    gulp.watch(['src/components/**/*.scss', '!src/components/**/media.scss'], collectComponentsSCSS, styles);
    gulp.watch(['src/components/**/media.scss'], collectComponentMediaSCSS, styles);
    gulp.watch(['src/scss/**/*.scss'], styles);
    gulp.watch(['src/components/**/*.js', 'src/js/main.js'], scripts);
}


export const startGulp = gulp.series(json, pug2html, collectComponentsSCSS, collectComponentMediaSCSS, styles, scripts);
export const buildImages = gulp.series(imagemin);
export const run = gulp.parallel(json, browsersync, watching);
// exports.pug2html = pug2html;
// exports.json = json;
// exports.styles = styles;
// exports.collectComponentsSCSS = collectComponentsSCSS;
// exports.collectComponentsMediaSCSS = collectComponentMediaSCSS;
// exports.browsersync = browsersync;
// exports.watching = watching;
// exports.scripts = scripts;
// exports.del = cleanBuild;

// exports.startGulp = series(pug2html, collectComponentsSCSS, collectComponentMediaSCSS, styles, scripts);
// exports.buildImages = series(imagemin);
// exports.default = parallel(json, browsersync, watching);
