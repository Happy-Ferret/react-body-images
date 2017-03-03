'use strict';

var React = require('react'),
  withSideEffect = require('react-side-effect');

function reducePropsToState(propsList) {
  var transitionSeconds = 4;
  var arrayImages = [];
  var result = propsList.map(function(props) {
    arrayImages = props.bgImageArray;
    if(typeof(props.transitionSeconds)!="undefined"){
      transitionSeconds = props.transitionSeconds;
    }
    return props.className;
  }).filter(function (value, index, self) {
    return self.indexOf(value) === index;
  }).join(' ');

  return {className:result,transitionSeconds:transitionSeconds,bgImageArray:arrayImages};
}

function backgroundSequence(bgImageArray,secs) {
  window.clearTimeout();
  var k = 0;
  for (var i = 0; i < bgImageArray.length; i++) {
    setTimeout(function(){
      document.body.style.background = "url(" + bgImageArray[k] + ") no-repeat center center fixed";
      document.body.style.backgroundSize ="cover";
      document.body.style.backgroundColor = "#999";
      if ((k + 1) === bgImageArray.length) { setTimeout(function() { backgroundSequence(bgImageArray,secs) }, (secs * 1000))} else { k++; }
    }, (secs * 1000) * i)
  }
}

function handleStateChangeOnClient(propiedades) {
  for (var key in propiedades) {
    if(key=="className"){
      document.body.className = propiedades[key] || '';
    }else if(key=="bgImageArray" && typeof(propiedades[key])!="undefined" && propiedades[key].hasOwnProperty("length") && propiedades[key].length>0){
      if(propiedades[key].length==1) {
        new Image().src = propiedades[key][0];
        document.body.style.background = "url("+propiedades[key][0]+") no-repeat center center fixed";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundColor = "#999";
      }else {
        propiedades[key].forEach(function(img){
          new Image().src = img;
          // caches images, avoiding white flash between background replacements
        });

        backgroundSequence(propiedades[key],propiedades["transitionSeconds"]);
      }
    }
  }
}

var DocumentTitle = React.createClass({
  propTypes: {
    className: React.PropTypes.string.isRequired,
    bgImageArray: React.PropTypes.array.isRequired,
    transitionsSeconds: React.PropTypes.number
  },

  render: function render() {
    if (this.props.children) {
      return React.Children.only(this.props.children);
    } else {
      return null;
    }
  }
});

module.exports = withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient
)(DocumentTitle);
