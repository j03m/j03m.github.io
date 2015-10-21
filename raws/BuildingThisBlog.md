# Publishing a Backbone, Browserify and ReactJs Powered Blog to Github.io with Gulp

I immediately dug the idea of the github.io powered blog. As a publishing system,
I was initially wooed by Jekyll. About a quarter of the way into the instructions
though, I found myself saying, "I want to do this from gulp, and I want to just
own the whole publishing chain." Jekyll also requires ruby last I looked and I
wanted to have something that was completely driven from node, gulp and git.

The first thing I knew is I wanted to write in my editor of choice using
Markdown because, well, Markdown is fast, fluent, easy and we all know it well
from creating github README.mds. I had no interest in web based editors. There
was nothing they really offered I couldn't do with markdown and markdown in my
mind was just easier to write.

I also wanted the site to be pretty and have some neat features that I could
code myself. This would also (in theory) allow me to build the scaffolding of
the site to taste, force me to brush up my CSS skills and generally let me have
a place to drop new client side web tech without much overhead.

I also didn't want to host a backend and I want to push and revise content in git.
Obviously github.io is the perfect fit, but I wanted to build up a scaffolding
that let me publish as easily as deploying code from git. I also wanted to be able to
save drafts and review them locally before pushing. All of these things are trivial
when you consider the object of creation is a piece of code, why not documents as well?

The result, a basic post reading website built with React, Backbone, Browserify and gulp. The gulp file has been extended
also take into account publishing posts from raw MD files and building a index files to serve as a sort fake backend that
serves a scrolling list of posts. But for the most part, the tech you see inside the gulp file is standard fair
if you've done any javascript development in the past.

## Usage

Using the blog is pretty straight forward. Basically a session goes like this:

* Start "gulp"
* Open a browser localhost:8000 (all configuration are in package.json)
* Write markdown files in the "raws" folder.
* Edit src to change styles, app logic, add functionality
* Gulp will automatically publish the changes and you can see them via live reload on your local site
* When everything is done and ready, do a gulp publish which will publish all of your content and update the indexes that handle post loading
* Push to github.io and enjoy the fruits of your labor

## Development

As mentioned in the title the blog itself uses Backbone + React. Someone asking why is probably valid so I'll address that first. Backbone basically let me set up some very simple models, routes and controllers and React provided me with an elegant solution for views. It really wasn't a lot of code to get them working together in collaborative manner and as we'll see I didn't need any special middleware or plugins.

I used Browserify because I love the simplicity it provides in allowing me to write nodejs style code. In addition, Browserify lets me easily test the javascript modules I write outside of the browser in Mocha, my test runner of choice. As a matter of practice, I tend to write code that accepts dependencies through the constructor so it is very trivial to write cross platform code and mocking tests by always making sure to  take platform or role specific bits of code via the constructor. We'll see more on that below.

## Views

Here is the code from the main content of the site. It's a fairly straight forward React class powered via JSX:

```
"use strict";
var React = require("react");
var PostList = require("./post-list-view.js");
var RightAside = require("./right-aside.js");
var LeftAside = require("./left-aside.js");
var Content = React.createClass({
    render: function(){
        return (
            <div className="content">
            <PostList content={this.props.content}/>
            <LeftAside/>
            <RightAside/>
            </div>
        );
    },
    componentDidUpdate: function(){
        if (this.props.scrollPosition){
            if (typeof global.scrollTo === "function"){
                global.scrollTo(this.props.scrollPosition.x, this.props.scrollPosition.y);
            }
        }
    }
});
module.exports = Content;
```

The post list component houses the main scrolling list of posts. We can see that like any good react app (or any good app in general) the view is completely uncoupled from any knowledge of what is providing data. In a moment, we'll see this class is going to be fed from Backbone, but it has no knowledge of Backbone what so ever. If we want to swap out Backbone later, we can.

```javascript
"use strict";
var React = require("react");
var PostSummary = require("./post-summary-view");
var PostFull = require("./post-full-view");
var PostList = React.createClass({
    getInitialState: function(){
        return {showPost: false};
    },
    render: function(){
        var posts = "";
        if (!this.props.content.isPost){
            posts = this.props.content.models.map(function(item){
                return <PostSummary postdata={item.attributes} />;
            });
        }else{
            return <PostFull postdata={this.props.content.post} />;
        }
        return (
            <div className="post-list">
                {posts}
            </div>
        );
    },
    closePost: function(){
        return this.getInitialState();
    }
});


module.exports = PostList;
```

## Models

Our models are powered by Backbone. Backbone allowed me to easily grab the static Json files that are generated by gulp publish and page through them as if they were a RESTful API. This required minimal code:

```javascript
"use strict";
var Backbone = require("backbone");
var PostModel = require("./post-model");
var _ = require("lodash");
var PostListCollection = Backbone.Collection.extend({
    model: PostModel,
    initialize: function(pages) {
        _.bindAll(this, "parse", "url", "more");
        this.page = 1;
        this.nextPage = 1;
        this.pages = pages;
    },
    fetch: function(options) {
        options = typeof options !== "undefined" ? options : {};
        this.trigger("fetching");
        var self = this;
        var success = options.success;
        options.remove = false;
        options.add = true;
        options.success = function(resp) {
            self.trigger("fetched");
            this.page = this.nextPage;
            if(success) { success(self, resp); }
        }.bind(this);
        return Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function(resp) {
        return resp; //array of models
    },
    url: function() {
        return "page." + this.nextPage + ".json";
    },
    more: function() {
        this.nextPage = this.page + 1;
        return this.fetch();
    }
});

module.exports = PostListCollection;
```

## Routes

I also took advantage of Backbone's routes which are still my favorite way to control the over all flow of an application. I realize there were react focused solutions like React Router, but I really wanted to maintain the ability to choose "the right" tech for the right job and not use React focused tech for the sake of using React. Backbone is really great at Models + Routes, so it was logical to use it for this part of the application.

```javascript
////set up the Backbone router
var Router = Backbone.Router.extend({
    routes: {
        "post/:title": "showPost",
        "*action": "defaultRoute"
    }
});

var appRouter = new Router();

appRouter.on("route:defaultRoute", function() {
    if (postListController.fetched){
        postListController.showList();
    }else{
        postListController.fetch().then(function(){
            postListController.showList();
        });
    }

});

appRouter.on("route:showPost", function(post){
    if (postListController.fetched){
        var lastScroll = { x: global.scrollX, y: global.scrollY};
        postListController.showPost(post, lastScroll);
    }else{
        postListController.fetch().then(function(){
            postListController.showPost(post);
        });
    }
});
```

## Controllers

As we saw in the routes code, I also wrote some controllers which have two roles. First they are glue between our models + views. Secondly they are the middle layer that builds the composition of the application.

```
"use strict";
var _ = require("lodash");
var $ = require("jquery");
function PostListController(collection, renderer){
    this.collection = collection;
    this.collection.on("fetched",
        function() {
            this.fetched = true;
    }.bind(this));
    this.renderer = renderer;
}

PostListController.Modes = {
    ShowPostMode: 1,
    ShowListMode: 2
};

Object.freeze(PostListController.Modes);

PostListController.prototype.fetch = function(){
    return this.collection.fetch();
};

PostListController.prototype.showList = function(){
    this.mode = PostListController.Modes.ShowListMode;
    return this.renderer.render(this.collection, this.lastScroll);
};

PostListController.prototype.showPost = function(title, lastScroll){
    this.lastScroll = lastScroll;
    this.mode = PostListController.Modes.ShowPostMode;
    var stuff = _.pluck(this.collection.models, "attributes");
    var post = _.find(stuff, function(item) {
        return item.title === title;
    });

    if (post.html === undefined){
        //fetch html for this post
        $.get(post.file, function(data){
            post.html = data;
            this.renderer.render({isPost: true, post: post});
        }.bind(this));
    }else{
        this.renderer.render({isPost: true, post: post});
    }
    return post;
};

PostListController.prototype.more = function(){
    return this.collection.more();
};

module.exports = PostListController;
```

As you can see the controller accepts it's Backbone model (collection) and it's view (renderer) via the constructor. By accepting our dependencies via the constuctor, we get easy framework-free dependency injection that can be leveraged to let us test all of this code
via Mocha, outside the browser.


For example, in our entry point, we compose everything together:
```javascript
var postListCollection = new PostListCollection();
var reactRenderer = new ReactRenderer();
var postListController = new PostListController(postListCollection, reactRenderer);
```

This composition and injection allows us to do some neat stuff while testing. For example writing
headless unit tests with a simple mock of the renderer:

```
var MockRenderer = function(){
    this.didRender = false;
}

MockRenderer.prototype.render = function(data){
    this.didRender = true;
    this.renderData = data;
}

module.exports = MockRenderer;
```


Becomes very trivial with code like:

```
it("should have a collection with models and trigger a render", function(done){
        var postListCollection = new PostListCollection();
        var pm = pageMock.bind(postListCollection);
        var renderer = new Renderer();
        var postListController = new PostListController(postListCollection, renderer);
        Backbone.ajax = backBoneMock.mockAjaxFulfillFn(pm);
        var p = postListController.fetch();
        p.then(function(){
            //validate the model
            assert(postListController.collection.models.length === 2);
            postListController.showList();
            assert(renderer.didRender);
            assert(renderer.renderData === postListController.collection);
            done();
        });
    });
```

Backbone can also be tricky pain to write non-browser unit tests for. However, because of the way Backbone is written it's pretty trivial to override the functions that physically dependon on aspects of the browser. I wrote some basic mock classes to deliver
data I wanted and monkey patched them into Backbone's ajax function:

```
exports.mockAjaxFulfillFn = function(fn){
    return function(options) {
        return new Promise(function(f,r){
            if (options.success){
                options.success(fn());
            }
            f(fn);
        });
    };
}
```

Here we fulfill a promise and access data provided from the test via closure at fulfillment time.


## Publishing workflow

Getting the contents of dist/ into master for github.io is also pretty straight forward. I call this the "release" stage. After you've published
to a branch that contains your current revisions, I basically wipe out master, move dist to master and force push it.

```
git checkout drafts-master
git branch -D master
git checkout --orphan master
git checkout dist drafts-master
git mv dist/* .
git add -u .
git commit -m "Publish"
git push origin master -f
```

I guess as a next step wrapping this all up in gulp-git would be ideal in something like a release task.


## Conclusion

In conclusion I feel like this was a great exercise. For one, the publishing aspect of the gulp file was great way to break out of the
way I normally use gulp and write some tasks that weren't standard fair. Plus I got a pretty useful tool out of it to boot.

In addition, it was pretty nice to get some disparate pieces of infrastructure working together. Wiring React, Backbone and mocha together I was
able to prove to myself that avoiding "all in one", "big framework" mentality by piecing together well written
portions of other frameworks was just as easy as digging through extensive documentation for something expansive.


