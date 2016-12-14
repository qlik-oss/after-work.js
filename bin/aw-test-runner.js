#! /usr/bin/env node
var runner = require( "../dist/runner" ).runner;
var debug = process.argv.indexOf( "--debug" ) !== -1;
var spawnArgs = debug ? ["node-debug", "resolve=mocha/bin/_mocha", "--debug-brk", "--no-timeouts"] : ["resolve=.bin/mocha"];
runner.execute( spawnArgs );
