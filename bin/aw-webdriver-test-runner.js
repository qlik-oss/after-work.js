#! /usr/bin/env node
/* eslint no-var:0, vars-on-top:0, no-console:0 */

var path = require('path');
var globby = require('globby');
var { runner } = require('../dist/runner');

var cwd = process.cwd();
var spawnArgs = ['resolve=.bin/protractor'];
var args = process.argv.slice(2);

const addConfigArgs = args.length && args[0][0] === '-';
if (addConfigArgs) {
  spawnArgs.push(path.relative(cwd, path.resolve(__dirname, '../dist/config/conf.js')));
}

var ix = args.indexOf('--specs');
if (ix !== -1) {
  var glob = args[ix + 1];
  // Convert comma seperated string to array if several glob are used
  glob = glob.split(', ');
  var files = globby.sync(glob);
  if (files.length) {
    args[ix + 1] = files.join(',');
  }
}

try {
  runner.execute(spawnArgs);
} catch (e) {
  var missingProtractor = "Cannot find module '.bin/protractor'";
  if (e.message === missingProtractor) {
    console.log("Protractor couldn't be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json");
  } else {
    console.log(e);
  }
}
