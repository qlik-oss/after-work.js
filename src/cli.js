#!/usr/bin/env node
/* eslint no-unused-expressions:0 */

const yargs = require('yargs');
require('./env');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

yargs
  .usage('aw <command>')
  .command(require('./node'))
  .command(require('./protractor'))
  .command(require('./cdp'))
  .command(require('./puppeteer'))
  .argv;
