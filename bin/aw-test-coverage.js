#! /usr/bin/env node
/* eslint no-var:0 */

var runner = require('../dist/runner').runner;

runner.execute(['resolve=.bin/istanbul', 'cover', 'resolve=mocha/bin/_mocha']);
