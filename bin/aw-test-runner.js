#! /usr/bin/env node
/* eslint no-var:0 */

var { runner } = require('../dist/runner');
var fs = require('fs');
var path = require('path');

var spawnArgs = [];
var cover = process.argv.indexOf('cover');
var debug = process.argv.indexOf('--debug') !== -1;

// Check for mocha options in repo
var mochaOpts = process.argv.indexOf('--opts') !== -1;
var mochaOptsFile = fs.existsSync(path.resolve(process.cwd(), 'test/mocha.opts'));

// Check for nyc options in repo
var nycSettingsProvided = false;
var packageJSON = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), { encoding: 'utf8' }));

if (cover !== -1) {
  process.argv.splice(cover, 1);
  spawnArgs.push('resolve=.bin/nyc');
  if (fs.existsSync(path.resolve(process.cwd(), '.nycrc'))) { nycSettingsProvided = true; }
  if (packageJSON.nyc) { nycSettingsProvided = true; }

  if (nycSettingsProvided) {
    console.log('Found nyc options for the repository, no defaults will be used'); // eslint-disable-line no-console
  } else {
    console.log('Adding default nyc options'); // eslint-disable-line no-console
    spawnArgs.push(
      '--reporter=text',
      '--reporter=lcov',
      '--all',
      '--include', 'src/**',
      '--require', 'babel-register',
    );
  }
}

spawnArgs.push('resolve=.bin/mocha');

if (!mochaOpts && !mochaOptsFile) {
  console.log('Adding default mocha options'); // eslint-disable-line no-console
  spawnArgs.push(
    '--require', path.relative(process.cwd(), path.resolve(__dirname, '../dist/config/global.js')),
    '--recursive',
  );

  if (cover === -1) {
    spawnArgs.push('--compilers', 'js:babel-core/register');
  }
} else {
  console.log('Found mocha options for the repository, no defaults will be used'); // eslint-disable-line no-console
}

if (debug) {
  spawnArgs.push(
    '--debug-brk',
    '--inspect',
    '--no-timeouts',
  );
  console.log('The followin options will be used:', spawnArgs); // eslint-disable-line no-console
}

runner.execute(spawnArgs);
