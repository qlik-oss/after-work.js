#!/usr/bin/env node
/* eslint no-unused-expressions:0 */

const yargs = require('yargs');
const importCwd = require('import-cwd');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

yargs
  .usage('aw <command>');

const tryAddCommand = (m) => {
  let cmd = null;
  try {
    // First try local (enables running aw from src)
    cmd = require(m); //eslint-disable-line
  } catch (e) {
    // Try installed
    cmd = importCwd.silent(m);
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

yargs
  .alias('h', 'help')
  .option('presetEnv', {
    description: 'Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset',
    default: path.resolve(__dirname, 'preset-env.js'),
    type: 'string',
  })
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;

