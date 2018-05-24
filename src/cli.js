#!/usr/bin/env node
/* eslint no-unused-expressions:0 */

const yargs = require('yargs');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

yargs
  .usage('aw <command>')
  .command(require('./node'))
  .command(require('./protractor'))
  .command(require('./cdp'))
  .command(require('./serve'))
  .command(require('./puppeteer'))
  .alias('h', 'help')
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;
