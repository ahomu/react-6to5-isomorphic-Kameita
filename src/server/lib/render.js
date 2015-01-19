/* @flow */

'use strict';

const DEFAULT_LAYOUT_NAME = 'layout';
const INJECT_CONTENT_NAME = 'content$';

let React = require('react');

module.exports = function() {
  return function(req, res, next) {
    let origRender = res.render;
    res.render = function() {

      let [componentName, data] = arguments;
      let RootComponent, rootElement;

      try {
        RootComponent = require('../../components/' + componentName + '.js');
      } catch(e) {
        next(e);
      }

      rootElement = RootComponent(data);
      data[INJECT_CONTENT_NAME] = React.renderComponentToString(rootElement);

      arguments[0] = DEFAULT_LAYOUT_NAME;
      arguments[1] = data;

      origRender.apply(this, arguments);
    };

    next();
  };
};
