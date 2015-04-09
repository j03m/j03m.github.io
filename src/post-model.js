"use strict";
var Backbone = require("backbone");
var PostModel = Backbone.Model.extend({
    initialize: function(){
        this.isaPost = true;
    },
    parse: function(data){
        return data;
    }
});
module.exports = PostModel;
