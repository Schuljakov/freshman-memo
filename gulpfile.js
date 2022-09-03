const { src, dest, watch, parallel, series} = require('gulp');
const fs = require('fs');

const pug          = require('gulp-pug');
const autoprefixer = require('gulp-autoprefixer');
const scss         = require('gulp-sass')(require('sass'));
const uglify       = require('gulp-uglify-es').default;
const imagemin     = require('gulp-imagemin');

const concat       = require('gulp-concat');
const del          = require('del');
const cleanCss     = require('gulp-clean-css');
const plumber      = require('gulp-plumber');
const gcmq         = require('gulp-group-css-media-queries');

const browserSync  = require('browser-sync').create();
const path         = require('path');
const data         = {};

function json() {
    try {
        const modules = fs.readdirSync('src/data/');
        modules.forEach(json => {
            const name = path.basename(json, path.extname(json));
            const file = path.join('./src/data', json);
            return data[name] = JSON.parse(fs.readFileSync(file));
        })
        console.log(data);
    } catch(e) {
        console.log(e);
    }
}

function pug2html() {
    return src('src/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            locals: { data : data }
        }))
        .pipe(dest('build'))
        .pipe(browserSync.stream());
}

function collectComponentsSCSS() {
    return src('src/components/**/*.scss')
        .pipe(concat('_components.scss'))
        .pipe(dest('src/components'));
}

function collectComponentMediaSCSS() {
    return src('src/components/**/media.scss')
        .pipe(gcmq())
        .pipe(concat('_media.scss'))
        .pipe(dest('src/components'));
}

function styles() {
    return src('src/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 12 version'],
            grid: true
        }))
        .pipe(cleanCss({compatibility: 'ie8', level: 2}))
        .pipe(dest('build/css'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src([
        'src/components/**/*.js',
        'src/js/main.js'
    ])
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(dest('build/js'))
    .pipe(browserSync.stream());
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'build/'
        }
    });
}

function imagesBuild() {
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

function watching() {
    watch(['src/pages/*.pug'], pug2html);
    watch('src/data/*.json', json, pug2html);
    watch(['src/components/**/*.scss', '!src/components/**/media.scss'], collectComponentsSCSS, styles);
    watch(['src/components/**/media.scss'], collectComponentMediaSCSS, styles);
    watch(['src/scss/**/*.scss'], styles);
    watch(['src/components/**/*.js', 'src/js/main.js'], scripts);
}

function cleanBuild() {
    return del('build');
}

exports.pug2html = pug2html;
exports.json = json;
exports.styles = styles;
exports.collectComponentsSCSS = collectComponentsSCSS;
exports.collectComponentsMediaSCSS = collectComponentMediaSCSS;
exports.browsersync = browsersync;
exports.watching = watching;
exports.scripts = scripts;
exports.del = cleanBuild;

exports.startGulp = series(pug2html, collectComponentsSCSS, collectComponentMediaSCSS, styles, scripts);
exports.buildImages = series(imagemin);
exports.default = parallel(json, browsersync, watching);
