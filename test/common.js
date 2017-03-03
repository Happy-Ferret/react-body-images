/*jshint newcap: false */
/*global describe, it, before */
'use strict';
var expect = require('expect.js'),
    React = require('react'),
    BodyImages = require('../');

describe('BodyImages', function () {
  before(function () {
    BodyImages.canUseDOM = false;
  });

  it('has a displayName', function () {
    var el = React.createElement(BodyImages);
    expect(el.type.displayName).to.be.a('string');
    expect(el.type.displayName).not.to.be.empty();
  });

  it('hides itself from the DOM', function () {
    var Component = React.createClass({
      render: function () {
        return React.createElement(BodyImages, {className: 'irrelevant'},
          React.createElement('div', null, 'hello')
        );
      }
    });
    var markup = React.renderToStaticMarkup(React.createElement(Component));
    expect(markup).to.equal('<div>hello</div>');
  });

  it('throws an error if it has multiple children', function (done) {
    var Component = React.createClass({
      render: function () {
        return React.createElement(BodyImages, {className: 'irrelevant'},
          React.createElement('div', null, 'hello'),
          React.createElement('div', null, 'world')
        );
      }
    });
    expect(function () {
      React.renderToStaticMarkup(React.createElement(Component));
    }).to.throwException(function (e) {
      expect(e.message).to.match(/^Invariant Violation:/);
      done();
    });
  });
  
  it('works with complex children', function () {
    var Component1 = React.createClass({
      render: function() {
        return React.createElement('p', null,
          React.createElement('span', null, 'c'),
          React.createElement('span', null, 'd')
        );
      }
    });
    var Component2 = React.createClass({
      render: function () {
        return React.createElement(BodyImages, {className: 'irrelevant'},
          React.createElement('div', null,
            React.createElement('div', null, 'a'),
            React.createElement('div', null, 'b'),
            React.createElement('div', null, React.createElement(Component1))
          )
        );
      }
    });
    var markup = React.renderToStaticMarkup(React.createElement(Component2));
    expect(markup).to.equal(
      '<div>' +
        '<div>a</div>' +
        '<div>b</div>' +
        '<div>' +
          '<p>' +
            '<span>c</span>' +
            '<span>d</span>' +
          '</p>' +
        '</div>' +
      '</div>'
    );
  });
});

describe('BodyImages.rewind', function () {
  it('clears the mounted instances', function () {
    BodyImages.rewind();
    React.renderToStaticMarkup(
      React.createElement(BodyImages, {className: 'a'},
        React.createElement(BodyImages, {className: 'b'},
          React.createElement(BodyImages, {className: 'c'}))
      )
    );
    expect(BodyImages.peek()).to.equal('a b c');
    BodyImages.rewind();
    expect(BodyImages.peek()).to.equal(undefined);
  });
  it('returns all the classNames used', function () {
    React.renderToStaticMarkup(
      React.createElement(BodyImages, {className: 'one'},
        React.createElement(BodyImages, {className: 'two'},
          React.createElement(BodyImages, {className: 'three'}))
      )
    );
    expect(BodyImages.rewind()).to.equal('one two three');
  });
  it('returns undefined if no mounted instances exist', function () {
    React.renderToStaticMarkup(
      React.createElement(BodyImages, {className: 'a'},
        React.createElement(BodyImages, {className: 'b'},
          React.createElement(BodyImages, {className: 'c'}))
      )
    );
    BodyImages.rewind();
    expect(BodyImages.peek()).to.equal(undefined);
  });
});
