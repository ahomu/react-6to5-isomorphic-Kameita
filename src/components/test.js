'use strict';

let React = require('react');
let Test2 = require('./test2');

module.exports = React.createClass({
  render() {
    return (
      <div>
        <h1>test component</h1>
        <Test2 />
      </div>
    )
  }
});
