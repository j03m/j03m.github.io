"use strict";
var Backbone = require("backbone");
var PostListController = require("../src/post-list-controller");
var PostListCollection = require("../src/post-list-collection"); //might have to rewire backbone here
var backBoneMock = require("../mocks/backbone-sync-mock");
var Renderer = require("../mocks/mockRenderer");
var assert = require("assert");

var mockPostPage1 = [
    {
        "id": 1,
        "file": "file1.html",
        "date": 1432169666207,
        "title": "title1!",
        "summary": "sum sum summary."
    },
    {
        "id": 2,
        "file": "BuildingThisBlog/index2.html",
        "date": 1432169666208,
        "title": "THIS BLOG WROTE ITSELF2!",
        "summary": "time?"
    }
];

var mockPostPage2 = [
    {
        "id": 1,
        "file": "file1.html",
        "date": 1432169666207,
        "title": "title1!",
        "summary": "sum sum summary."
    },
    {
        "id": 2,
        "file": "BuildingThisBlog/index2.html",
        "date": 1432169666208,
        "title": "THIS BLOG WROTE ITSELF2!",
        "summary": "time?"
    }
];

function pageMock(){
    if (this.url().indexOf(".1.")){
        return mockPostPage1;
    }else{
        return mockPostPage2;
    }
}


//inject model, backbone etc test ability to render + invoke more
//figure out how to show a post with the backbone router
//controller probably needs router injected as well

describe("test controller actions with injected dependencies", function(){
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

    it("should have a collection with models and trigger a render when we call more", function(done){
        var postListCollection = new PostListCollection();
        var pm = pageMock.bind(postListCollection);
        var renderer = new Renderer();
        var postListController = new PostListController(postListCollection, renderer);
        Backbone.ajax = backBoneMock.mockAjaxFulfillFn(pm);
        var p = postListController.more();
        p.then(function(){
            //validate the model
            assert(postListController.collection.models.length === 2);
            postListController.showList();
            assert(renderer.didRender);
            done();
        }).catch(function(e){
            console.log("more - promise failed.");
            throw e;

        });
    });

    it("should not increment page on 404s", function(done){
        var postListCollection = new PostListCollection();
        var renderer = new Renderer();
        var postListController = new PostListController(postListCollection, renderer);
        Backbone.ajax = backBoneMock.mockAjaxReject();
        var p = postListController.more();
        p.then(function(){
            throw new Error("wat?");
        }).catch(function(){
            assert(postListController.collection.page === 1);
            assert(postListController.collection.nextPage === 2);
            done();

        });
    });
});


