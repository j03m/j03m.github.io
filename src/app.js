"use strict";
var Backbone = require("backbone");
var PostListController = require("./post-list-controller");
var ReactRenderer = require("./react-renderer");
var PostListCollection = require("./post-list-collection");

var postListCollection = new PostListCollection();
var reactRenderer = new ReactRenderer();
var postListController = new PostListController(postListCollection, reactRenderer);

////set up the backbone router
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

//hook window onscroll here
window.addEventListener("scroll", function(){
    //detect if at page bottom, if so invoke MORE on controller (should rerender with new posts)
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // you"re at the bottom of the page
        if (postListController.mode === PostListController.Modes.ShowListMode){
            var p = postListController.more();
            p.then(function(){
                postListController.showList();
            });
        }


    }
    //call more
});

// Start Backbone history a necessary step for bookmarkable URL"s
Backbone.history.start();
global.router = appRouter;

//todo: make backbone use lodash
//todo: center header
//todo: add twitter/github links
//todo: fix ctrl chars in md to html
//todo: twitter/facebook etc
//todo: concat/min/sourcemaps
//todo: rewrite first post, break up into multiple articles if needed



