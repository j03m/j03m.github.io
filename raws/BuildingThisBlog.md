I immediately dug the instantness of github.io. Being pretty bare bones though
I was initially woed by Jekyll. About a quarter of the way into the instructions
though, I found myself saying. You know what - you've done so little web stuff
in recent days. Why don't you take a moment and build it out yourself?

The first thing I knew is I wanted to write in my editor of choice using
Markdown because, well, Markdown is fast, fluent, easy and we all know it well
from creating github README.mds.

I also wanted the site to be pretty and have some neat features that I could
code myself. This would also (in theory) allow me to build the scaffolding of
the site to taste, force me to brush up my CSS skills and generally let me have
a place to drop new client side web tech without much overhead. (I'm sure at
some point I'll need a server, but we'll see).

I don't want to host a backend and I want to push and revise content in git.
Obviously github.io is the perfect fit, but I wanted to build up a scaffolding
that let me publish as easily as deploying code. I also wanted to be able to
save drafts and review them locally before pushing.

So the first post in this blog is how I built this blog. One of my favorite
blog of all time both for content, layout and style is www.substack.net (which
is also gitpowered, but I still want to write my own), so I'll pattern off off
that for general usability. (Imitation is the the most sincere form of flattery?)
We'll have a scrolling lists of posts and click through to view the full post.

Last but not least, it was my intention to get a first version of this done in
under and hour while on the train to work, so simplicity and time was of
primary importance.

So off to the races.

First things first: *Easy markdown to html*

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
we need some real code in there to do some real stuff. Wiring tests is easy, so
lets do that first.

```javascript
var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    return gulp.src('tests/**/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('build_content', function () {
    console.log('Working!');
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

For building content, we'll need another target command that will leverage
md2post.js. Streams hurt my head and I find them opaque but I suppose there is
no arguing the hard performance benefits. To get around my personal brain power
limitations I'm going to use through2 which allows me think in terms of
functional blocks but still get the benefit of streaming.



```
npm install through2 --save-dev
```

From here, I'll wire up a stream/function that will build our posts from





