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
