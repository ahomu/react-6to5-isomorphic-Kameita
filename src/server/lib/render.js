/* @flow */

'use strict';

const DEFAULT_LAYOUT_NAME = 'layout';
const VAR_INJECT_CONTENT  = 'content$';
const VAR_INJECT_PROPS    = 'props$';
const VAR_ROOT_COMPONENT  = 'root$';

let React = require('react');

module.exports = function() {
  return function(req, res, next) {
    let origRender = res.render;
    res.render = function() {

      let [componentName, data] = arguments;
      let RootComponent, RootFactory;

      try {
        RootComponent = require(`../../components/${componentName}.js`);
        RootFactory   = React.createFactory(RootComponent);
      } catch(e) {
        next(e);
      }

      data[VAR_INJECT_PROPS]   = JSON.stringify(data);
      data[VAR_INJECT_CONTENT] = React.renderToString(RootFactory(data));
      data[VAR_ROOT_COMPONENT] = componentName;

      arguments[0] = DEFAULT_LAYOUT_NAME;
      arguments[1] = data;

      origRender.apply(this, arguments);
    };

    next();
  };
};
