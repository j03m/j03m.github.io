# THIS BLOG WROTE ITSELF!

Well, no it didn't. But this blog for all intents an purposes created by the
tools it aims to describe and serves as an outline as to how a server-less blog
can be created using github.io for hosting, nodejs and gulp.

I immediately dug the instantness of github.io. Being pretty bare bones though
I was initially woed by Jekyll. About a quarter of the way into the instructions
though, I found myself saying. You know what - you've done so little web stuff
in recent days. Why don't you take a moment and build it out yourself?

The first thing I knew is I wanted to write in my editor of choice using
Markdown because, well, Markdown is fast, fluent, easy and we all know it well
from creating github README.mds. I had no interest in web based editors. I tried
Medium and couldn't figure out a way to format a code snippet that could compete
with Github's very simple &#96&#96&#96javascript.

I also wanted the site to be pretty and have some neat features that I could
code myself. This would also (in theory) allow me to build the scaffolding of
the site to taste, force me to brush up my CSS skills and generally let me have
a place to drop new client side web tech without much overhead. (I'm sure at
some point I'll need a server, but we'll see).

I also didn't want to host a backend and I want to push and revise content in git.
Obviously github.io is the perfect fit, but I wanted to build up a scaffolding
that let me publish as easily as deploying code. I also wanted to be able to
save drafts and review them locally before pushing.

The plan seemed simple: Create a set of gulp scripts that converted md files to blog posts.
Host the blog locally so I could see live updates and use git to manage version. What could go wrong?

So the first post in this blog is how I built this blog. One of my favorite
blog of all time both for content, layout and style is [www.substack.net](www.substack.net)
(which is also gitpowered, but I still want to write my own), so I'll pattern off of
that for general usability and coolness. (Imitation is the the most sincere form of flattery?)
We'll have a scrolling lists of posts and click through to view the full post.

So off to the races.



## First things first: *Easy markdown to html*

(https://github.com/chjj/marked)[chjj/marked] stood out here
as my best option for node as the syntax highlighting sample was simple to follow
and if I don't have syntax hilighting then I know down the line I'm going to be
sad.

(I guess we'll put that to the test now, with a github style code bracket)

First we install some prereqs and end up with an already impressively long
package.json:

```javascript
{
  "name": "j03m.github.io",
  "version": "1.0.0",
  "description": "J03m's blog. ",
  "main": "index.html",
  "scripts": {
    "test": "none"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/j03m/j03m.github.io"
  },
  "keywords": [
    "j03m"
  ],
  "author": "j03m",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/j03m/j03m.github.io/issues"
  },
  "homepage": "https://github.com/j03m/j03m.github.io",
  "dependencies": {
    "bluebird": "^2.9.24",
    "marked": "^0.3.3",
    "pygmentize-bundled": "^2.3.0",
    "yargs": "^3.7.0"
  }
}

```

You can google the depedencies I used, but basically this handles promises, md
conversion, syntax highlighting and cli options.

Okay and marked is installed. So at this point I decided I'd start writing some
really simple commandline style scripts for blog actions and eventually wire
them together with gulp for watching markdowns, transforming and pushing branches
with gitjs.

But I'm getting ahead of myself. Let's test some write some js code that will
generate this post and see how it looks. This is almost mind blowing.

```javascript
#!/usr/bin/env node
var marked = require('marked');
var pb = require('pygmentize-bundled');
var fs = require('fs');
var Promise = require('bluebird');
var fsp = Promise.promisifyAll(fs);
var markedP = Promise.promisify(marked);
var pbp = Promise.promisify(pb);


function md2post(input) {
    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function (code, lang, callback) {
            pbp({lang: lang, format: 'html'}, code).then(function (result) {
                callback(null, result.toString());
            }); //crash on reject
        }
    });
    return markedP(input);
};
exports.md2post = md2post;


function transform(input, output) {
    return fsp.readFileAsync(input).then(function (rawFile) {
        return md2post(rawFile.toString());
    }).then(function (html) {
        return fs.writeFileAsync(output, html);
    });
}
exports.transform = transform;


if (!module.parent) {
    var argv = require('yargs').usage('Usage: $0 --input [path to input file] --output [path to output file]')
        .demand(['input', 'output'])
        .argv;
    transform(argv.input, argv.output).then(function (result) {
        console.log("Success!");
        process.exit(0);
    }).error(function (e) {
        console.log("Failed:", e);
        process.exit(-1);
    });
}
```

So now we have a command line util + module that will do our markdown to html transformations. Exciting.

A quick:

```
> chmod u+x md2post.js
> ./md2post.js --input BuildingThisBlog.md --output out.html
```

Verifies that we indeed have some purty html (look familiar?):

```html
<p>I immediately dug the instant-ness of github.io. Being pretty bare bones though
I was initially woo-ed by Jekyll. About a quarter of the way into the instructions
though, I found myself saying. You know what - you&#39;ve done so little web stuff
in recent days. Why don&#39;t you take a moment and build it out yourself?</p>
```

## Testing

To verify that we don't break things moving forward, let's be good citizens and
write some tests. For that I like mocha, which we'll add to our deps:

```
> npm install -g mocha
```

For our test, we'll keep it simple and only test the transform method. To do this
though we have a physical dependency on fs, which will make things hard to test.
To inject that without having to monkey around with a proper dependency injection
pattern, we'll use rewire.

```
> npm install rewire --save-dev
```

Then a really simple test. We'll grab a fragment from the marked tests, since
we're not trying to verify it's ability to parse markdown, only that our code
paths work. And then we'll write a simple test that verifies promise rejection on
file input.

```javascript
var rewire = require("rewire");
var assert = require("assert")

var Promise = require("bluebird");
describe('md2post', function(){
    describe('transforms', function(){
        it('success write a file', function(done){
            var md2post = rewire("../lib/md2post.js");
            var input = "inputfile.md";
            var output = "outputfile.md";
            var fsMock = {
                readFileAsync: function (path, encoding) {
                    return new Promise(function(f,r){
                        assert(path===input, "Input path should be correct");
                        f("Paragraph. " +
                        "\n> * bq Item 1 " +
                        "\n> * bq Item 2 " +
                        "\n>   * New bq Item 1 " +
                        "\n>   * New bq Item 2 " +
                        "\n>   Text here " +
                        "\n" +
                        "\n* * *");
                    });
                },
                writeFileAsync: function(path, data){
                    return new Promise(function(f,r){
                        assert(path==output, "Output path should be correct");
                        var expected = "<p>Paragraph. </p>\n" +
                            "<blockquote>\n" +
                            "<ul>\n" +
                            "<li>bq Item 1 </li>\n" +
                            "<li>bq Item 2 <ul>\n" +
                            "<li>New bq Item 1 </li>\n" +
                            "<li>New bq Item 2 \n" +
                            "Text here </li>\n" +
                            "</ul>\n" +
                            "</li>\n" +
                            "</ul>\n" +
                            "</blockquote>\n" +
                            "<hr>\n";

                        for(var i =0;i<expected.length;i++){
                            if (expected[i] != data[i]){
                                console.log("Diff at char:",i);
                            }
                        }

                        assert(data===expected,"Output should be correct");
                        f(true);
                        done();
                    });
                }
            };
            md2post.__set__("fsp", fsMock);
            return md2post.transform(input,output);
        });

        it('file failures reject properly', function(done){
            var md2post = require("../lib/md2post.js"); //no dep stub needed
            md2post.transform("fake", "fake").then(function(){
                assert(false);
            }).error(function(e){
                assert(true);
                done();
            })
        });
    })
})```

## The bigger picture

Okay, but now I knew I needed a way to manage posts. Some method for organizing
and indexing them. What we'll do here is follow a simple scheme of title/index.html
for post locations. Then we'll create a scheme for creating an index that we'll
use to fetch additional posts on scroll. Last we'll generate a site map and
submit it to google. After that, we'll wire up gulp command for generating
all this stuff on the fly.

Let's do some stuff with gulp file watchers. Now, we'll set up gulp to monitor
a posts directory for changes. When it detects one it will convert the modified
files to html and store them in a directory named for the title and index.html.

Doing that will give us the naming structure domain/post-title-text. Installing
gulp:

```
npm install -g gulp
npm install gulp --save-dev
```

Next, we'll create a basic gulp file watch and watch our "raws" directory which
will contain raw mds. We'll also watch lib and test and cause modifications
there to trigger mocha. For this we'll use gulp.watch and gulp-mocha.

```
npm install gulp-mocha --save-dev
```

Our initial skeleton GulpFile.js looks like:

```javascript
var gulp = require('gulp');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    console.log('Testing!');
});

gulp.task('build_content', function () {
    console.log('Building!');
});

gulp.task('default', function () {
    watch('lib/**/*.js', batch(function () {
        gulp.start('test');
    }));

    watch('tests/**/*.js', batch(function () {
        gulp.start('test');
    }));

    watch('raws/**/*.md', batch(function () {
        gulp.start('build_content');
    }));
});
```

We can edit raws and lib to verify we see the correct console output. But,
we need some real code in there to do some real stuff. Wiring tests is easy well
use the gulp-mocha plugin and use gulp.watch to trigger it off of changes to
our lib or tests directory.

For building content, we'll need another target command that will leverage
md2post.js. Streams hurt my head and I find them opaque but I suppose there is
no arguing the hard performance benefits. To get around my personal brain power
limitations I'm going to use through2 which allows me think in terms of
functional blocks but still get the benefit of streaming.

Here, we'll create a function called processMdFiles that will get passed to
through2 and used in our "build_content" task. The function cheats a bit,
operates converts the buffer from our vinyl file to a string, transforms and
then rebuffers it. As a later project we'll see if we can get marked working
with streams. I suppose we should have looked or written a gulp-marked plugin,
but this will suffice for now.

Our final gulp file looks like:


```javascript
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
```
Now, as I save this blog post, an equivalent file is written to ./dist but is
formatted with html. This is cool, but I don't want
to write to ./dist/filename.md. I actually want to take the post name, create a directory
and then inside place an index.html file. After that I'll need to start thinking
about the main index and what our blog template will look like.

Gulp-rename passed a function lets us do the path swap pretty easily. Our
build_content task turns into:

```
gulp.task('build_content', function () {
    return gulp.src('raws/**/*.md')
        // tap into the stream to get each file's data
        .pipe(through2.obj(processMdFiles))
        .pipe(rename(newPath))
        .pipe(gulp.dest("./dist"))
});
```
With this function handling the rename details:

```javascript
function newPath(pathObj) {
    pathObj.dirname = path.join(pathObj.dirname, pathObj.basename)
    pathObj.basename = "index";
    pathObj.extname = ".html";
}
```
## The even bigger picture

Next up I needed to figure out what I wanted to do about an index. I didn't know
much about SEO or blogging in general, but I knew I needed some way for posts to
get ingested. I also knew I wanted to easily be able to submit a post to twitter,
fb, hacker news and the like. I also wanted a pretty single page app experience.
How would I go about getting both? I needed to look at a real world example to
make sure I was going about this the right way.

After some thought I decided I would organize posts into numeric txt files in groups of
10. I'd have a main template which would get updated with the "latest" group of 10. But
as you scrolled it would grab the next group of 10 and their associated snippets.

Things just got more complex. Before I started automating all of this with gulp, I really
needed to lock down some client code to make sure it was in fact what I wanted. At this point,
my knee jerk reaction said - hey this is a great time to checkout react. And so I did.

## Taking some time to think about the experience with ReactJS.

Everything in React is components. Which I like. So now let's take a moment to think through
what components this blog will have. My initial thoughts looked like this:

* Main Scroll List of Posts - displays N post summaries at a time and lets us scroll through and load more on scroll end
* Post Summary Card
** Title
** Snippet
* Full Post View (this should be a single page)
** Title
** Body
* Tweets side bar
** Tweet
* Instapaper side bar
** Headline

That seems pretty easy. For Models, we'll likely use Backbone and potentially some Browserify
because I like my js node-like. Quick shout out to (Tyler McGinnis)[http://tylermcginnis.com/] who wrote
(this)[http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/] very
awesome tutorial on React which I used to accumulate my current (paltry) knowledge. Bear in mind I haven't
done anything in the web front-end world in a while so bear with me.

## Flexing

I've never really loved css layouts. I don't think anyone ever has. That said, flexbox is finally a css layout
scheme I can both grok and get behind. So, given the layout above, I came up with the following flexbox layout
using node sass compiled it down to a template.

```css
test
```

With a really basic html skeleton:

```html
test
```

## Moar au-tomatoe-ating

This let me see that I had the basic blocks I was looking for. After fiddling
with this a bit I decided I needed to extend my gulp file to handle some of the
repetitive tasks I'd been dealing with. As I worked on the sass + html, I found
myself constantly forgetting to compile + refresh my workspace. So, I decided
to take care of that and extended my gulp file with a new watch and auto-reload
express web app and gulp-sass for compilation. This was also a much needed break
from fiddling with CSS properties. :/

To do this we do some new installs:

```
npm install express --save-dev

```

Express will be our web framework. We'll write it up as part of our default task
and have it serve our ./dist directory and also make it a pre-req for our default
task.

```
gulp.task('default', ['serve'], function () {
    gulp.watch('lib/**/*.js',['test']);
    gulp.watch('tests/**/*.js', ['test']);
    gulp.watch('raws/**/*.md', ['build_content']);
    gulp.watch('template/**/*.scss', ['compile_sass']);
    gulp.watch('template/**/*.*', ['reload']);
});

gulp.task('serve', function() {
    var express = require('express');
    var app = express();
    app.use(express.static('./dist'));
    app.listen(8000);
});
```

Now if I navigate to http://localhost:8000/buildingthisblog I see the latest
transformed post via index.html. Cool. But now I need some more watchers and
I need the site to auto reload anytime I modify stuff.

For this we'll need connect-livereload and tinylr. Which we can also install:

```
npm install connect-livereload tiny-lr --save-dev
```

We'll add these to our gulpfile and modify express to receive connect-livereload
as middleware:
```javascript
var lrserver = require('tiny-lr')();

var EXPRESS_PORT = 8000;
var EXPRESS_ROOT = './dist';
var LIVERELOAD_PORT = 35729;

var app = express();
app.use(require('connect-livereload')());
app.use(express.static(EXPRESS_ROOT));

```

We then modify the serve task:

```javascript
gulp.task('serve', function(){
    lrserver.listen(LIVERELOAD_PORT);
    app.listen(EXPRESS_PORT);
});
```

Last, we add a function for refreshing. This will again leverage the through2
signature:

```javascript
function notifyLivereload(chunk, enc, cb) {
    lrserver.changed({
        body: {
            files: [chunk.path]
        }
    });
    this.push(chunk);
    cb();
}
```

Now, where ever we make a change that should refresh the browser, we can add a:
```javascript
     .pipe(through2.obj(notifyLivereload));
```

We'll add that to some new tasks: sass and cp as well as build_content.

Disclaimer: there is also a
plugin called gulp-livereload which seems to be set up to do this for us, however
my first run with proved unsuccessful, so I rolled my own steam processor with
through2. I may just have missed something.

For sass and cp, I want to create task for handling sass compilation to css and
 a task that will copy any modified html templates to dist. We also install gulp-sass for
 handling sass compilation.

 ```javascript
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
 ```

 And some new watchers:

 ```javascript
    gulp.watch('template/**/*.scss', ['sass']);
    gulp.watch('template/**/*.html', ['cp']);

 ```

## Gulpfile 2.0

Okay, it's been a while and our gulpfile has grown a bit since we last looked.
Let's get another snapshot before diving back into our adventures with css and
flexbox and making a beautiful template for a beautiful blog.

```javascript
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

```

## Refining the templates (aka more html and css gah :/ )















