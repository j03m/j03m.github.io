var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var through2 = require('through2');
var md2post = require('./util/md2post.js');
var path = require('path');
var express = require('express');
var sass = require('gulp-sass');
var lrserver = require('tiny-lr')();
var fs = require('fs');
var _ = require('lodash');
var Promise = require('bluebird');
var fsp = Promise.promisifyAll(fs);
var packageJson = require('./package.json');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var replace = require('gulp-replace');
var jsdom = require('jsdom');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');
var runSequence = require('run-sequence');
var git = require("gulp-git");
var jetpack = require("fs-jetpack");
git = Promise.promisifyAll(git);

var POSTS_PER_PAGE = packageJson.config.POSTS_PER_PAGE;
var EXPRESS_PORT = packageJson.config.EXPRESS_PORT;
var LIVERELOAD_PORT = packageJson.config.LIVERELOAD_PORT;
var SUMMARY_LENGTH = packageJson.config.SUMMARY_LENGTH;

var app = express();
var page1IndexData;
app.use(require('connect-livereload')());
app.use(express.static(packageJson.paths.destinations.dist));

gulp.task('build_app', ['sass', 'test', 'lint'], function () {
    console.log('Building: ************************');
    return browserify(packageJson.paths.entryPoint)
        .transform(reactify)
        .bundle()
        .pipe(source(packageJson.paths.destinations.build))
        .pipe(gulp.dest(packageJson.paths.destinations.dist))
        .pipe(through2.obj(notifyLivereload))
        .on('error', function(e){ throw e;});
});

gulp.task('test', function () {
    return gulp.src(packageJson.paths.tests, {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('build_content', function () {
    return gulp.src(packageJson.paths.mds)
        // tap into the stream to get each file's data
        .pipe(through2.obj(processMdFiles))
        .pipe(rename(newPath))
        .pipe(gulp.dest(packageJson.paths.destinations.dist))
        .pipe(through2.obj(notifyLivereload));
});

gulp.task('default', ['serve'], function () {
    gulp.watch(packageJson.paths.util, ['test', 'lint']);
    gulp.watch(packageJson.paths.src, ['build_app']);
    gulp.watch(packageJson.paths.tests, ['test', 'lint']);
    gulp.watch(packageJson.paths.mds, ['build_content']);
    gulp.watch(packageJson.paths.sass, ['sass']);
    gulp.watch(packageJson.paths.html, ['cp']);
    gulp.watch(packageJson.paths.css, ['cp']);
});

gulp.task('serve', function () {
    lrserver.listen(LIVERELOAD_PORT);
    app.listen(EXPRESS_PORT);
});

gulp.task('release', function(){
    runSequence(
        'dist2stage',
        'git-release'
    );
});

gulp.task('dist2stage', function(){
    jetpack.delete(packageJson.paths.destinations.temp);
    return gulp.src(path.join(packageJson.paths.destinations.dist, "**/*"))
        .pipe(gulp.dest(packageJson.paths.destinations.temp));
});

gulp.task('git-release', function(){
    git.execAsync({args: "checkout master"}).then(function(checkout) {
        var content = path.join(packageJson.paths.destinations.temp, "/*");
        jetpack.move(content, "./");
        jetpack.delete(packageJson.paths.destinations.temp);
    });
    //    return git.execAsync({args: "git add -u"});
    //}).then(function(){
    //    return git.execAsync({args: "git commit -m content release " + new Date()});
    //}).then(function(){
    //    return git.execAsync({args: "git push origin master"});
    //});
});


gulp.task('sass', function () {
    gulp.src(packageJson.paths.sass)
        .pipe(sass())
        .pipe(gulp.dest(packageJson.paths.destinations.dist))
        .pipe(through2.obj(notifyLivereload));
});

gulp.task('readInitialIndex', function(done){
    fsp.readFileAsync('./page.1.json').then(function (data) {
        page1IndexData = data.toString();
        done();
    }).catch(function (err) {
        page1IndexData = {
            title: 'Test title',
            body: 'Test body'
        }
        done();
    });
});

gulp.task('lint', function() {
    var src = gulp.src(packageJson.paths.src)
        .on('error', gutil.log);

    var test = gulp.src(packageJson.paths.tests)
        .on('error', gutil.log);

    var util = gulp.src(packageJson.paths.util)
        .on('error', gutil.log);

    merge(src, test, util)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        .on('error', gutil.log);
});

gulp.task('cp', ['readInitialIndex'], function (done) {
    var html = gulp.src(packageJson.paths.html)
        .pipe(gulp.dest(packageJson.paths.destinations.dist))

    var css = gulp.src(packageJson.paths.css)
        .pipe(gulp.dest(packageJson.paths.destinations.dist))


    var json = gulp.src(packageJson.paths.index)
        .pipe(gulp.dest(packageJson.paths.destinations.dist))

    return merge(html,json, css).pipe(through2.obj(notifyLivereload))

});

gulp.task('publish', function(){
    runSequence(
        'publish-worker',
        'cp'
    );
});


gulp.task('all', function(){
    runSequence(
        'build_content',
        'build_app',
        'publish'
    );
});

gulp.task('publish-worker', function (done) {

    function finish(index) {
        //turn it into a list of files only
        var published = _.pluck(index, 'file');

        //gulp src mds
        gulp.src(packageJson.paths.mds)
            //gulp src mds
            .pipe(through2.obj(filterFiles(published)))
            //add new mds to the index with date.now
            .pipe(through2.obj(modifyIndex(index)))
            .on('finish', updateIndex(index, done))
    }

    //read + parse index if it exists
    var index;
    fsp.readFileAsync('./index.json').then(function (data) {
        index = JSON.parse(data);
        finish(index)
    }).catch(function (err) {
        index = {};
        finish(index);
    });

});


function newPath(pathObj) {
    pathObj.dirname = path.join(pathObj.dirname, pathObj.basename);
    pathObj.basename = 'index';
    pathObj.extname = '.html';
}

//because vinyl has it's own path obj? Ugh.
function filePathFromPath(pathObj) {
    var obj = {};
    obj.dir = './dist/' + pathObj.name;
    obj.name = 'index';
    obj.ext = '.html';
    obj.base = 'index.html';
    return path.format(obj);
}

function linkPathFromPath(pathObj) {
    var obj = {};
    obj.dir = pathObj.name;
    obj.name = 'index';
    obj.ext = '.html';
    obj.base = 'index.html';
    return path.format(obj);
}

function processMdFiles(chunk, enc, cb) {
    var promise = md2post(chunk.contents.toString());
    promise.then(function (result) {
        chunk.contents = new Buffer(result, 'utf-8');
        this.push(chunk);
        cb();
    }.bind(this));
}


function notifyLivereload(chunk, enc, cb) {
    console.log('CHANGE:', chunk.path);
    lrserver.changed({
        body: {
            files: [chunk.path]
        }
    });
    this.push(chunk);
    return cb();
}


function filterFiles(files) {
    return function realFilter(chunk, enc, cb) {
        if (files.indexOf(chunk.path) === -1) {
            this.push(chunk);
        }
        cb();
    }
}

function modifyIndex(index) {
    console.log('modifyIndex');
    return function modifier(chunk, enc, cb) {
        var obj = path.parse(chunk.path);
        var file = filePathFromPath(obj);
        var that = this;
        console.log('pre-env');
        //todo: switch to cherrio
        jsdom.env({
            file: file,
            done: function (errors, window) {
                if (errors){
                    console.log('Errors has happened, bailing:', errors);
                    throw new Error(errors);
                }else{
                    console.log('window is defined:', window!=undefined);
                    index[obj.name] = {
                        file: linkPathFromPath(obj),
                        date: Date.now(),
                        title: window.document.querySelector('h1').innerHTML,
                        summary: function(){
                            //build an N char summary out of p tags
                            console.log('self executing');
                            var pTags = window.document.querySelectorAll('p');
                            var summary = '';
                            for(var i=0;i<pTags.length;i++){
                                var p = pTags[i];
                                summary+= p.innerHTML;
                                if (summary.length>SUMMARY_LENGTH){
                                    break;
                                }
                            }
                            return summary;

                        }()
                    }
                    that.push(chunk);
                    cb();
                }

            }
        });
    }
}

function updateIndex(index, done) {
    var once = false;
    return function IndexUpdater() {
        if (!once) {
            //all posts by date
            var posts = _.values(index);
            var sorted = _.sortBy(posts, 'date');
            var count = 1;
            var promises = [];

            //write the index
            promises.push(fsp.writeFileAsync('./index.json', JSON.stringify(index)));

            //write the posts
            while (sorted.length) {
                var chunk = sorted.splice(0, POSTS_PER_PAGE);
                promises.push(fsp.writeFileAsync('./page.' + count + '.json', JSON.stringify(chunk, null, '\t')));
                count++;
            }

            Promise.all(promises).then(function (res) {
                done();
            }).catch(function (e) {
                console.error('Failed to write index pages.');
                throw new Error(e);
            });

        } else {
            console.error('Why are you still calling me?');
        }
    }
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]); // padding
};