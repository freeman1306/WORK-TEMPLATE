'use strict';
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    // uglify = require('gulp-uglify-es'),
    terser = require('gulp-terser'),
    sass = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssMin = require('gulp-minify-css'),
    rimRaf = require('rimraf'),
    browserSync = require('browser-sync'),
    // tinypng = require('gulp-tinypng-compress'),
    newer = require('gulp-newer'),
    rename = require("gulp-rename"),
    fileinclude = require('gulp-file-include'),
    plumber = require('gulp-plumber'),
    tinypng = require('gulp-tinypng-extended'),
    criticalCss = require('gulp-critical-css'),
    gulpMozjpeg = require('@vslutov/gulp-mozjpeg'),
    imageminPngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    jpegtran = require('jpegtran-bin'),
    imagemin = require('gulp-imagemin'),
    uncss = require('gulp-uncss'),
    brotli = require('gulp-brotli'),
    svgmin = require('gulp-svgmin'),
    replace = require('gulp-replace'),
    // cheerio = require('cheerio'),
    svgSprite = require('gulp-svg-sprite'),
    cheerio = require('gulp-cheerio'),
    reload = browserSync.reload;



var path = {
    build: {
        html: 'build',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fnts: 'build/fonts/',

    },
    src: {
        html: 'src/[*.html, pages/*.html]',
        js: 'src/js/**/*.js',
        // style: 'src/style/**/*.scss',
        css: 'src/css/**/.css',
        img: 'src/img/**',
        fnts: 'src/fonts/**',


    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        // style: 'src/style/**/*.scss',
        img: 'src/img/**',
        fnts: 'src/fonts/**',
        css: 'src/css/**/*.css',
        svg: 'src/**/*.svg'
    },
    clean: './build',
    cleanLayout: './build/template',
};

gulp.task('webserver', function (done) {
    browserSync({
        server: {
            baseDir: './build'
        },
        host: 'localhost',
        port: 8081,
        // tunnel: true
    });

    done();
});

gulp.task('fileinclude', function () {
    gulp.src(['index.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('html:build', function (done) {
    gulp.src(['src/index.html', 'src/pages/**/*.html'])
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));

    done();
})


gulp.task('imagemin', function () {
    return gulp.src('src/img/**/*.{jpg,png,jpeg}')
        .pipe(
            plumber()
        )
        .pipe(
            tinypng({
                key: '52RfSCvovOcN37pIpip4Dm0dQ221zq1k',
                sigFile: 'src/img/.tinypng-sigs',
                log: true
            })
        )
        .pipe(cache(imagemin([

            imageminPngquant({
                speed: 1,
                quality: [0.95, 1] //lossy settings
            }),
            imagemin.jpegtran({
                progressive: true
            }),

            gulpMozjpeg({
                quality: 90
            })
        ])))


        .pipe(gulp.dest('build/img'));
});








gulp.task('fonts', function (done) {
    gulp.src('src/fonts/**')

        .pipe(gulp.dest('build/fonts'));

    done();
});




gulp.task('svg', function (done) {
    gulp.src('src/img/icons/**/*.svg')

        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))

        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: 'sprite.svg',

                }
            }
        }))
        .pipe(gulp.dest('build/img/icons'));

    done();
});




gulp.task('criticalcss', () => {
    gulp.src('src/css/main.css')
        .pipe(criticalCss())
        .pipe(gulp.dest('build/css'));
});


gulp.task('uncss', function (done) {
    gulp.src('src/')

        .pipe(uncss({
            html: ['index.html', 'pages/**/*.html']
        }))
})


gulp.task('css', function (done) {
    gulp.src('src/css/**')

        .pipe(gulp.dest('build/css'));

    done();
});

gulp.task('js:build', function (done) {

    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourceMaps.init())
        .pipe(terser())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));

    done();

});



gulp.task('brotli', function () {
    return gulp.src('build/**/*')
        .pipe(brotli.compress())
        .pipe(gulp.dest('build_compressed/'));
});


gulp.task('build', [
    'html:build', 'criticalcss', 'uncss', 'css', 'js:build', 'imagemin', 'svg', 'fonts'
]);

gulp.task('watch', function () {
    watch([path.watch.js], function (ev, callback) {
        gulp.start('js:build');
    });
    watch([path.watch.html], function (ev, callback) {
        gulp.start('html:build');
    });

    watch([path.watch.img], function (ev, callback) {
        gulp.start('images');
    });
    watch([path.watch.svg], function (ev, callback) {
        gulp.start('svg');
    });
    watch([path.watch.fnts], function (ev, callback) {
        gulp.start('fonts');
    });

});

gulp.task('clean', function (callback) {
    rimRaf(path.clean, callback);
});

// gulp.task('cleanLayout', function (callback) {
//     rimRaf(path.cleanLayout, callback);
// });





gulp.task('default', ['build', 'webserver', 'watch']);

// gulp.task('default', ['build', 'webserver', 'watch']);