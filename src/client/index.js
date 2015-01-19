/* @flow */

'use strict';

require('6to5/runtime');
require('6to5/polyfill');

document.addEventListener('DOMContentLoaded', function() {
  let React = require('react');
  let Test = require('../components/test');

  React.render(<Test name="John" />, document.getElementById('mount'));
});
