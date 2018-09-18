const path = require('path');
const {
  packages,
  TEST_GLOB,
  SRC_GLOB,
  WATCH_GLOB,
} = require('@after-work.js/utils');

module.exports = {
  'presetEnv.enable': {
    description: 'Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset',
    default: true,
    type: 'boolean',
  },
  'presetEnv.require': {
    description: 'Require path to preset-env.js',
    hidden: true,
    default: path.resolve(__dirname, 'preset-env.js'),
    type: 'string',
  },
  scope: {
    description: 'Scope to package',
    default: [],
    choices: packages,
    type: 'array',
    alias: 's',
  },
  config: {
    description: 'Path to config file',
    type: 'string',
    default: null,
    alias: 'c',
  },
  test: {
    description: 'Glob pattern',
    default: TEST_GLOB,
    type: 'array',
    alias: 'glob',
  },
  src: {
    description: 'Glob pattern for all source files',
    default: SRC_GLOB,
    type: 'array',
  },
  watch: {
    description: 'Watch changes',
    default: false,
    type: 'boolean',
    alias: 'w',
  },
  watchGlob: {
    description: 'Watch glob',
    default: WATCH_GLOB,
    type: 'array',
    alias: 'wg',
  },
  coverage: {
    description: 'Generate coverage',
    default: false,
    type: 'boolean',
  },
  hookRequire: {
    description: 'Hook require to be able to mock and transform files',
    default: true,
    type: 'boolean',
  },
  'babel.enable': {
    description: 'Enable babel',
    default: true,
    type: 'boolean',
  },
  'babel.core': {
    description: 'Path to babel core module',
    default: '',
    type: 'string',
  },
  'babel.babelPluginIstanbul': {
    description: 'Path to babel plugin istanbul module',
    default: 'babel-plugin-istanbul',
    type: 'string',
  },
  'babel.options': {
    description: 'Babel options',
    default: {
    },
    type: 'object',
  },
  'babel.typescript': {
    description: 'Path to typescript compiler module',
    default: 'typescript',
    type: 'string',
  },
  'filter.node.packages': {
    description: 'Filter packages shown in interactive mode in Node',
    default: [() => true],
    type: 'array',
  },
  'filter.chrome.packages': {
    description: 'Filter packages shown in interactive mode in Node',
    default: [() => true],
    type: 'array',
  },
  'filter.puppeteer.packages': {
    description: 'Filter packages shown in interactive mode in Node',
    default: [() => true],
    type: 'array',
  },
  'filter.node.files': {
    description: 'Filter files shown in interactive mode in Node',
    default: [() => true],
    type: 'array',
  },
  'filter.chrome.files': {
    description: 'Filter files shown in interactive mode in Node',
    default: [() => true],
    type: 'array',
  },
  'filter.puppeteer.files': {
    description: 'Filter files shown in interactive mode in Node',
    default: [() => true],
    type: 'array',
  },
};
