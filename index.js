'use strict';

var React = require('react'),
    withSideEffect = require('react-side-effect');

var inDebugMode = false, removeBgImages = true,transitionSeconds = 4, bgImageArray = [], uuid = "";

function reducePropsToState(propsList) {
  //variable used to see the changes between routes. Each route create new uuid
  uuid =  Math.floor((1 + Math.random()) * 0x10000).toString(16);
  var result = propsList.map(function(props) {
    if(typeof(props.inDebugMode)!="undefined") {
      inDebugMode = props.inDebugMode;
      if(inDebugMode) console.log("react-body-images in debug mode. UUID:"+uuid);
    }else{
      //If the value of inDebugMode is not specified, we set it to false.
      inDebugMode = false;
    }

    if(typeof(props.bgImageArray)!="undefined") {
      if(inDebugMode) console.log("The images array was received.");
      bgImageArray = props.bgImageArray;

      if(typeof(props.removeBackgroundImages)!="undefined") {
        if(inDebugMode) console.log("The value of remove background images was received.");
        //You maybe specify the this value to false in order to NOT show the images.
        removeBgImages = props.removeBackgroundImages;
      }else{
        //If you don't specify the value of remove background images, we set it to false in order to show the images.
        removeBgImages = false;
      }
      if(removeBgImages){
        if(inDebugMode) console.log("The value of remove background images is true. Then we clear the image array.");
        bgImageArray = [];
      }
      if(!removeBgImages && typeof(props.transitionSeconds)!="undefined"){
        transitionSeconds = props.transitionSeconds;
      }
    }else{
      if(inDebugMode) console.log("No images array was received.");

      if(typeof(props.removeBackgroundImages)!="undefined") {
        //This is in case you have already background images using react-router and you WANT to keep the images showing. So you have to set the value to 'false'.
        removeBgImages = props.removeBackgroundImages;
      }else {
        //If we don't set the remove background image boolean, by default we remove background image.
        //This is in case you have already background images using react-router and you don't want to keep the images.
        removeBgImages = true;
      }
      if(removeBgImages) {
        if (inDebugMode) console.log("The images array wasn't received And the instruction of remove background images was set to true, then We clear the image array.");
        bgImageArray = [];
      }
    }
    return props.className;
  }).filter(function (value, index, self) {
    return self.indexOf(value) === index;
  }).join(' ');

  return {className:result};
}

function backgroundSequence(k,timeout) {
  if(inDebugMode) console.log("backgroundSequence UUID:"+uuid);
  if(typeof(timeout)!="undefined" && timeout!=null) {
    if(inDebugMode) console.log("There are a timeout, delete it.");
    window.clearTimeout(timeout);
  }

  if(!removeBgImages){
      timeout = setTimeout(function(){
        if(inDebugMode) console.log("Setting Background Image:"+bgImageArray[k]);
          document.body.style.background = "url(" + bgImageArray[k] + ") no-repeat center center fixed";
          document.body.style.backgroundSize = "cover";
          if ((k + 1) === bgImageArray.length) { setTimeout(function() { backgroundSequence(0,timeout) }, (transitionSeconds * 1000))} else { k++; backgroundSequence(k,timeout); }
      }, (transitionSeconds * 1000))
  }else if(inDebugMode){
    console.log("The instruction is not background image.");
  }

}

function handleStateChangeOnClient(propiedades) {
  var className = propiedades["className"];

  if(inDebugMode) {
    console.log("handleStateChangeOnClient UUID:"+uuid);
    console.log("removeBackgroundImages:" + removeBgImages);
    console.log("bgImageArray:" + bgImageArray);
    console.log("transitionSeconds:" + transitionSeconds);
    console.log("className:" + className);
  }

  if(!removeBgImages && typeof(bgImageArray)!="undefined" && bgImageArray.hasOwnProperty("length") && bgImageArray.length>0){
    if(bgImageArray.length==1) {
      document.body.setAttribute('data-remove-backgroundimage',false);
      if(inDebugMode) {
        console.log("loading image:"+bgImageArray[0]);
      }
      new Image().src = bgImageArray[0];
      document.body.style.background = "url("+bgImageArray[0]+") no-repeat center center fixed";
      document.body.style.backgroundSize = "cover";
    }else {
      document.body.setAttribute('data-remove-backgroundimage',false);
      bgImageArray.forEach(function(img){
        if(inDebugMode) {
          console.log("Preloading image:"+img);
        }
        new Image().src = img;
        // caches images, avoiding white flash between background replacements
      });

      if(inDebugMode) {
        console.log("Setting the first background image:"+bgImageArray[0]);
        console.log("Start creating images transitions logic.");
      }
      document.body.style.background = "url("+bgImageArray[0]+") no-repeat center center fixed";
      document.body.style.backgroundSize = "cover";
      backgroundSequence(1,null);
    }
  }else if(removeBgImages==true){
    if(inDebugMode) {
      console.log("Setting background-image to 'none' and add data attribute.");
    }
    document.body.style.background = "none";
    document.body.setAttribute('data-remove-backgroundimage',true);
  }

  if(typeof(className)!="undefined"){
    document.body.className = className || '';
  }
}

var DocumentTitle = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    bgImageArray: React.PropTypes.array,
    transitionsSeconds: React.PropTypes.number,
    removeBackgroundImages: React.PropTypes.bool,
    inDebugMode: React.PropTypes.bool
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