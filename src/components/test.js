'use strict';

let React = require('react');
let Test2 = require('./test2');

let Test = React.createClass({
  render() {
    return (
      <div>
        <h1 id="hoge">test component</h1>
        <p>{this.props.foo}</p>
        <Test2 />
      </div>
    )
  }
});

module.exports = Test;
