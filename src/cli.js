#!/usr/bin/env node
/* eslint no-unused-expressions:0, prefer-destructuring: 0, no-console: 0, import/no-dynamic-require: 0, quote-props: 0, max-len: 0 */
const yargs = require('yargs');
require('./env');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

yargs
  .usage('aw <command>')
  .command(require('./node'))
  .command(require('./browser'))
  .command(require('./webdriver'))
  .command(require('./cdp'))
  .argv;
