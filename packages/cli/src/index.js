#!/usr/bin/env node
/* eslint no-unused-expressions:0 */

const yargs = require('yargs');
const importCwd = require('import-cwd');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

yargs
  .usage('aw <command>');

const tryAddCommand = (m) => {
  let cmd = importCwd.silent(m);
  if (cmd === null) {
    try {
      cmd = require(m); //eslint-disable-line
    } catch (e) { } //eslint-disable-line
  }
  if (cmd !== null) {
    yargs.command(cmd);
  }
};

[
  '@after-work.js/node',
  '@after-work.js/cdp',
  '@after-work.js/protractor',
  '@after-work.js/puppeteer',
  '@after-work.js/serve',
].forEach(tryAddCommand);

const { presetEnv } = yargs
  .alias('h', 'help')
  .option('presetEnv', {
    description: 'Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset',
    default: true,
    type: 'booelan',
  })
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;

if (presetEnv) {
  importCwd('@after-work.js/cli/src/preset-env');
}
