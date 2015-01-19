/* @flow */

'use strict';

require('6to5/runtime');
require('6to5/polyfill');

let path = require('path');
let express = require('express');
let hbs = require('hbs');
let render = require('./lib/render');
let app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../client')));
app.use(render());

app.get('/', function(req, res, next) {
  res.render('test', {foo: 'bar'});
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
