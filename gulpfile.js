var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    gutil = require('gulp-util');



var useref = require('gulp-useref');
var filter = require('gulp-filter');
var csso = require('gulp-csso');
 
gulp.task("index", function() {
  var jsFilter = filter("**/*.js", { restore: true });
  var cssFilter = filter("**/*.css", { restore: true });
  var indexHtmlFilter = filter(['**/*', '!**/main.html'], { restore: true });
 
  return gulp.src("publicapp/main.html")
    .pipe(useref())      // Concatenate with gulp-useref
    .pipe(jsFilter)
    .pipe(uglify())             // Minify any javascript sources
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(csso())               // Minify any CSS sources
    .pipe(cssFilter.restore)
    .pipe(indexHtmlFilter)
    .pipe(rev())                // Rename the concatenated files (but not index.html)
    .pipe(indexHtmlFilter.restore)
    .pipe(revReplace())         // Substitute in new filenames
    .pipe(gulp.dest('public'));
});


/*


gulp.task('js', function () {
    return gulp.src('./publicapp/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })

        .pipe(concat('app.js'))

        // добавляем версию в имя файла
        .pipe(rev())
        .pipe(gulp.dest('./public/js/'))
        // сохраняем версию в файл - понадобится позже
        .pipe(rev.manifest('../rev-manifest-lib.json'))
        ///.pipe(gulp.dest('./build'))


        .pipe(gulp.dest('./public/js'));
});

gulp.task('html',   function () {
    var manifest = gulp.src([
        './public/rev-manifest-lib.json'
    ]);

    return gulp.src('./publicapp/main.html')
        .pipe(revReplace({
            manifest: manifest 
        }))
        // переименуем файл
       // .pipe(rename("main.html"))
        .pipe(gulp.dest('./public'));
});

gulp.task('start', ['js', 'html']);
*/