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
