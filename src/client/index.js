/* @flow */

'use strict';

const IDENT_INITIALIZER  = 'initializer';
const IDENT_MAIN_CONTENT = 'content';

require('6to5/runtime');
require('6to5/polyfill');
require('../components/**/*', { glob: true });

document.addEventListener('DOMContentLoaded', function() {
  let initEl = document.getElementById(IDENT_INITIALIZER);
  let initProps = JSON.parse(initEl.innerHTML || '{}');
  let rootComponentName = initEl.getAttribute('data-root-component');

  let React = require('react');
  let RootFactory = React.createFactory(require(`../components/${rootComponentName}.js`));

  React.render(RootFactory(initProps), document.getElementById(IDENT_MAIN_CONTENT));
});
