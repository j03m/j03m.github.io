var gulp = require('gulp');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var through2 = require('through2');
var md2post = require('./lib/md2post.js');
var path = require('path');
var express = require('express');
var sass = require('gulp-sass');
var lrserver = require('tiny-lr')();

var EXPRESS_PORT = 8000;
var EXPRESS_ROOT = './dist';
var LIVERELOAD_PORT = 35729;

var app = express();
app.use(require('connect-livereload')());
app.use(express.static(EXPRESS_ROOT));


gulp.task('test', function () {
    return gulp.src('tests/**/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('build_content', function () {
    return gulp.src('raws/**/*.md')
        // tap into the stream to get each file's data
        .pipe(through2.obj(processMdFiles))
        .pipe(rename(newPath))
        .pipe(gulp.dest(EXPRESS_ROOT))
        .pipe(through2.obj(notifyLivereload));
});

gulp.task('default', ['serve'], function () {
    gulp.watch('lib/**/*.js',['test']);
    gulp.watch('tests/**/*.js', ['test']);
    gulp.watch('raws/**/*.md', ['build_content']);
    gulp.watch('template/**/*.scss', ['sass']);
    gulp.watch('template/**/*.html', ['cp']);

});

gulp.task('serve', function(){
    lrserver.listen(LIVERELOAD_PORT);
    app.listen(EXPRESS_PORT);
});


gulp.task('sass', function () {
    gulp.src('./template/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(EXPRESS_ROOT))
        .pipe(through2.obj(notifyLivereload));
});

gulp.task('cp', function () {
    gulp.src('./template/*.html')
        .pipe(gulp.dest(EXPRESS_ROOT))
        .pipe(through2.obj(notifyLivereload));
});

function newPath(pathObj) {
    pathObj.dirname = path.join(pathObj.dirname, pathObj.basename);
    pathObj.basename = "index";
    pathObj.extname = ".html";
}

function processMdFiles(chunk, enc, cb){
    var promise = md2post(chunk.contents.toString());
    promise.then(function(result){
        chunk.contents = new Buffer(result, "utf-8");
        this.push(chunk);
        cb();
    }.bind(this));
}

function notifyLivereload(chunk, enc, cb) {
    console.log(chunk.path);
    lrserver.changed({
        body: {
            files: [chunk.path]
        }
    });
    this.push(chunk);
    cb();
}

