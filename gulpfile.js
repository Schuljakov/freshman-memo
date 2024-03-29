const gulp = require("gulp");

const { src, dest } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync");
const fileinclude = require("gulp-file-include");
const replace = require("gulp-string-replace");

// For live-reloading
const reload = browserSync.reload;

// Compile scss
gulp.task("compiler", function () {
    return src("src/scss/**/*.scss")
        .pipe(
            sass({
                outputStyle: "expanded",
            }).on("error", sass.logError)
        )
        .pipe(concat("style.css"))
        .pipe(dest("./src/"));
});

// Starting live-reload server
gulp.task("browserSync", function () {
    browserSync.init({
        server: {
            baseDir: "./src",
        },
        open: false,
        notify: true,
    });
});

// For recompilation
gulp.task("watch", function () {
    gulp.watch("src/**/*.scss", gulp.series("compiler")).on("change", reload),
    gulp.watch("src/**/*.html").on("change", reload);
    gulp.watch("src/js/*.js").on("change", reload);
    gulp.watch("./src/img/**").on("change", reload);
});

// Copy img folder from ~ to build
gulp.task("imageCopy", function () {
    return gulp.src("./src/img/**").pipe(gulp.dest("./build/img"));
});

// Copy index.html folder from ~ to build
gulp.task("jsCopy", function () {
    return gulp.src("./src/js/*.js").pipe(gulp.dest("./build/js"));
});

gulp.task("cssCopy", function (){
    return gulp.src("./src/style.css").pipe(gulp.dest("./build/"));
});

// File include
gulp.task("fileinclude", async function () {
    gulp.src(["./src/**/*.html"])
        .pipe(
            fileinclude({
                prefix: "@@",
                basepath: "@file",
            })
        )
        .pipe(gulp.dest("./build/"));
});

gulp.task("replace", async function () {
    gulp.src(["./build/*.css", "./src/*.html"]) // Any file globs are supported
        .pipe(replace("style.css", "/tips-for-students/style.css"))
        .pipe(replace("./index.html", "/tips-for-students"))
        .pipe(replace("./main.html", "/tips-for-students/main"))
        .pipe(replace("./help.html", "/tips-for-students/help"))
        .pipe(replace("./education.html", "/tips-for-students/education"))
        .pipe(replace("./digital-system.html", "/tips-for-students/digital-system"))
        .pipe(replace("./non-education.html", "/tips-for-students/non-education"))
        .pipe(replace("index.html", "/tips-for-students"))
        .pipe(replace("main.html", "/tips-for-students/main"))
        .pipe(replace("help.html", "/tips-for-students/help"))
        .pipe(replace("digital-system.html", "/tips-for-students/digital-system"))
        .pipe(replace("non-education.html", "/tips-for-students/non-education"))
        .pipe(replace("./menu.html", "/tips-for-students/menu"))
        .pipe(replace("./updates.html", "/tips-for-students/updates"))
        .pipe(replace("./img", "/tips-for-students/img"))
        .pipe(replace('src="img/', 'src="/tips-for-students/img/'))

        .pipe(gulp.dest("./build/"));
});

// The default task
gulp.task(
    "default",
    gulp.series("compiler", "imageCopy", "jsCopy", "cssCopy", "fileinclude", "replace"),
    function (done) {
        done();
    }
);

// For developer
gulp.task(
    "dev",
    gulp.series(
        gulp.parallel("compiler", "watch", "browserSync"),
        function (done) {
            done();
        }
    )
);
