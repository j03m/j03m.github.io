"use strict";
var assert = require("assert");
var Backbone = require("backbone");
var PostModel = require("../src/post-model");
var mockPost = {
    "id": 1,
    "file": "BuildingThisBlog/index.html",
    "date": 1432169666207,
    "title": "THIS BLOG WROTE ITSELF!",
    "summary": "Well, no it didn't. But this blog for all intents an purposes created by the\ntools it aims to describe and serves as an outline as to how a server-less blog\ncan be created using github.io for hosting, nodejs and gulp."
};



/*
* Our models have little to no functionality. They are just vessels for
* json properties returned by the "server". Here we just verify that our
* mock json turns up in the way we expect.
* */
describe("model tests - basic", function() {
    it("should generate models with the attributes we expect", function(done){
        var plm = new PostModel({id: 1});
        //jack a url in there, even though we don"t use it in the app
        plm.url = function(){ return "lalalal"; };
        Backbone.ajax = require("../mocks/backbone-sync-mock").mockAjaxFulfill(mockPost);
        plm.fetch().then(function(){
            assert(plm.id === mockPost.id);
            assert(plm.attributes.file === mockPost.file);
            assert(plm.attributes.date === mockPost.date);
            assert(plm.attributes.title === mockPost.title);
            assert(plm.attributes.summary === mockPost.summary);
            done();
        });
    });
});
