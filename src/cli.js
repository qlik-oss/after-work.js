#!/usr/bin/env node
/* eslint no-unused-expressions:0, prefer-destructuring: 0, no-console: 0, import/no-dynamic-require: 0, quote-props: 0, max-len: 0 */
const yargs = require('yargs');
require('./config/global');

process.env.NODE_ENV = 'test';

yargs
  .usage('aw <command>')
  .commandDir('commands')
  .argv;
