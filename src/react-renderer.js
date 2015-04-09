"use strict";
var React = require("react");
var Content = require("./content.js");
function ReactRenderer (){
}
ReactRenderer.prototype.render = function(data, scrollPosition){
    React.render(<Content content={data} scrollPosition={scrollPosition}/>,
        document.getElementById("app"));
};

module.exports = ReactRenderer;
