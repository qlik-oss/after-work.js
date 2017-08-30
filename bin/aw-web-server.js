#! /usr/bin/env node
/* eslint no-var:0, vars-on-top:0 */

var program = require('commander');
var path = require('path');
var utils = require('../dist/utils');

var config = {
  logLevel: 'info',
};

program
  .option('-c, --config [file]', 'BrowserSync config file ( json )')
  .parse(process.argv);

if (program.config) {
  var configFile = path.resolve(process.cwd(), program.config);
  config = require(configFile); // eslint-disable-line
}

utils.httpServer(config);
