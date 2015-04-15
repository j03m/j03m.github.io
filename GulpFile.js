var gulp = require('gulp');
var mocha = require('gulp-mocha');
var tap = require('gulp-tap');
var rename = require('gulp-rename');
var through2 = require('through2');
var md2post = require('./lib/md2post.js');
var path = require('path');


gulp.task('test', function () {
    return gulp.src('tests/**/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('build_content', function () {
    return gulp.src('raws/**/*.md')
        // tap into the stream to get each file's data
        .pipe(through2.obj(processMdFiles))
        .pipe(gulp.dest("./dist"))
});

gulp.task('default', function () {
    gulp.watch('lib/**/*.js',['test']);
    gulp.watch('tests/**/*.js', ['test']);
    gulp.watch('raws/**/*.md', ['build_content']);
});

function processMdFiles(chunk, enc, cb){
    var promise = md2post(chunk.contents.toString());
    promise.then(function(result){
        var filePath = chunk.path;
        chunk.contents = new Buffer(result, "utf-8");
        this.push(chunk);
        cb();
    }.bind(this));

}


