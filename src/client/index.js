/* @flow */

'use strict';

require('6to5/runtime');
require('6to5/browser-polyfill');

var react = require('react');

module.exports = react.createClass({
  displayName: 'hoge',
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

function foo(): number {
  return 123;
}
