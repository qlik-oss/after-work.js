#! /usr/bin/env node
/* eslint no-var:0 */

var { runner } = require('../dist/runner');

var cover = process.argv.indexOf('cover') !== -1;
var spawnArgs = cover ? ['resolve=.bin/nyc'] : ['resolve=.bin/mocha'];

runner.execute(spawnArgs);
