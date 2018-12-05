const { TEST_GLOB } = require('@after-work.js/utils');

module.exports = {
  presetEnv: {
    description:
      'Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset',
    default: true,
    type: 'boolean',
  },
  config: {
    description: 'Path to config file',
    type: 'string',
    default: null,
    alias: 'c',
  },
  test: {
    description: 'Glob pattern',
    type: 'string',
    default: TEST_GLOB,
    alias: 'glob',
  },
  coverage: {
    description: 'Generate coverage',
    type: 'boolean',
    default: false,
  },
  require: {
    description: 'Require path',
    default: [],
    type: 'array',
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
    default: {},
    type: 'object',
  },
  typescript: {
    description: 'Path to typescript compiler module',
    default: 'typescript',
    type: 'string',
  },
  'filter.protractor.files': {
    description: 'Filter files for Protractor runner',
    default: ['**'],
    type: 'array',
  },
};
