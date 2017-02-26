const gulp = require('gulp');

//Plugin Imports
const htmlclean = require('gulp-htmlclean');
const stripdebug = require('gulp-strip-debug');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const htmlmin = require('gulp-htmlmin');

 
//Gulp Tasks Definitions

gulp.task('clean:html', () =>
    gulp.src('src/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'))
);
 
gulp.task('minify:js', () =>
    gulp.src('src/js/*')
        .pipe(stripdebug())
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
);

gulp.task('copy:font-awesome', () =>
    gulp.src('src/css/font-awesome/**/*')
        .pipe(gulp.dest('dist/css/font-awesome'))
);

gulp.task('minify:css',['copy:font-awesome'],() =>
    gulp.src('src/css/*')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css'))
);

gulp.task('build', ['clean:html', 'minify:js', 'minify:css']);
