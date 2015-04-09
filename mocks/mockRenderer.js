var MockRenderer = function(){
    this.didRender = false;
}

MockRenderer.prototype.render = function(data){
    this.didRender = true;
    this.renderData = data;
}

module.exports = MockRenderer;