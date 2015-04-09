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
