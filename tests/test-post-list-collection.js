"use strict";
var assert = require("assert");
var PostListCollection = require("../src/post-list-collection");
var Backbone = require("backbone");
var backBoneMock = require("../mocks/backbone-sync-mock");
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
        "id": 3,
        "file": "file1.html",
        "date": 1432169666207,
        "title": "title1!",
        "summary": "sum sum summary."
    },
    {
        "id": 4,
        "file": "BuildingThisBlog/index2.html",
        "date": 1432169666208,
        "title": "THIS BLOG WROTE ITSELF2!",
        "summary": "time?"
    }
];



describe("create and get more posts", function() {

    it("should have page  ===  1 when created", function(){
        var postListCollection = new PostListCollection();
        assert(postListCollection.page === 1);
    });

    it("should have all the models we expect after fetching", function(done){
        Backbone.ajax = backBoneMock.mockAjaxFulfill(mockPostPage1);
        var postListCollection = new PostListCollection();
        postListCollection.fetch().then(function(){
            //i gotz modelz?
            assert(postListCollection.models.length === 2);

            //models got attributes?
            var m1 = postListCollection.models[0];
            var m2 = postListCollection.models[1];

            assert.deepEqual(m1.attributes, mockPostPage1[0]);
            assert.deepEqual(m2.attributes, mockPostPage1[1]);
            done();
        });
    });

    it("should have all the models from the next page when we page forward", function(done){
        var postListCollection = new PostListCollection();
        Backbone.ajax = backBoneMock.mockAjaxFulfillFn(function(){
            if (this.url().indexOf(".1.") !== -1){
                return mockPostPage1;
            }else{
                return mockPostPage2;
            }
        }.bind(postListCollection));

        postListCollection.fetch().then(function(){
            return postListCollection.more();
        }).then(function(){
            //i gotz modelz?
            assert(postListCollection.models.length === 4); //should have 4 models

            //models got attributes?
            var m1 = postListCollection.models[0];
            var m2 = postListCollection.models[1];
            var m3 = postListCollection.models[2];
            var m4 = postListCollection.models[3];


            assert.deepEqual(m1.attributes, mockPostPage1[0]);
            assert.deepEqual(m2.attributes, mockPostPage1[1]);
            assert.deepEqual(m3.attributes, mockPostPage2[0]);
            assert.deepEqual(m4.attributes, mockPostPage2[1]);
            done();
        });
    });
});
