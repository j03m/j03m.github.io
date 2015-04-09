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

