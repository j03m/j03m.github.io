"use strict";
var React = require("react");
var LeftAside = React.createClass({
    render: function(){
        return (
            <aside className="left-stuff">
                <div className="header">
                    <div className="supporting-text side-bar">
                            <h3>Javascript enhanced cyber primate</h3>
                            <p>by j03m</p>

                            <a href="http://twitter.com/j03m" class="social" target="_blank"><i className="fa fa-twitter"></i> Twitter</a>
                            <br/>
                            <a href="http://github.com/j03m" class="social" target="_blank"><i className="fa fa-github"></i> GitHub</a>

                    </div>
                </div>
            </aside>
        );
    }
});

module.exports = LeftAside;
