"use strict";
var moment = require("moment");
var React = require("react");
var PostSummary = React.createClass({
    render: function(){
        var dateString = moment(this.props.postdata.date).format("MMM Do YYYY");
        return (<div className="post" onClick={this.onClick}>
            <div className="post-header" onClick={this.onClick}>
            {dateString}
            </div>
            <header className="post-title" onClick={this.onClick}>
            {this.props.postdata.title}
            </header>
            <article className="post-body" onClick={this.onClick}>
                {this.props.postdata.summary}
            </article>
            <div className="post-footer supporting-text" onClick={this.onClick}>
                <a href={"#post/" + this.props.postdata.title}>Continue reading...</a>
            </div>
        </div>);
    },
    onClick: function(){
        document.location = "#post/" + this.props.postdata.title;
    }
});

module.exports = PostSummary;
