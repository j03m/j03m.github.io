/*
* <a href="https://twitter.com/share" class="twitter-share-button" data-via="j03m">Tweet</a>
 <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
* */


"use strict";
var moment = require("moment");
var React = require("react");
var PostFull = React.createClass({
    render: function(){
            var dateString = moment(this.props.postdata.date).format("MMM Do YYYY");
            return (
                <div className="post">
                <div className="post-header">
                    <div className="post-date">
                    {dateString}
                    </div>
                    <div className="post-back supporting-text">
                        <a href="#">Back</a>
                    </div>
                </div>
                <article className="post-body">
                    <div className="post" id="viewedPost" dangerouslySetInnerHTML={{ __html: this.props.postdata.html }} />

                </article>
            </div>);
    }
});
module.exports = PostFull;
