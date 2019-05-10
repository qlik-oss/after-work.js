const {
  packages,
  TEST_GLOB,
  SRC_GLOB,
  WATCH_GLOB,
  DEFAULT_SRC_EXT_PATTERN,
  DEFAULT_TEST_EXT_PATTERN,
  DEFAULT_INSTRUMENT_EXCLUDE_PATTERN,
} = require('@after-work.js/utils');

module.exports = {
  presetEnv: {
    description:
      'Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset',
    default: true,
    type: 'boolean',
  },
  require: {
    description: 'Require path',
    default: [],
    type: 'array',
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
  testExt: {
    description: 'Test file extensions glob pattern',
    default: DEFAULT_TEST_EXT_PATTERN,
    type: 'string',
  },
  src: {
    description: 'Glob pattern for all source files',
    default: SRC_GLOB,
    type: 'array',
  },
  srcExt: {
    description: 'Source file extensions glob pattern',
    default: DEFAULT_SRC_EXT_PATTERN,
    type: 'string',
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
    default: {},
    type: 'object',
  },
  'babel.typescript': {
    description: 'Path to typescript compiler module',
    default: 'typescript',
    type: 'string',
  },
  'filter.node.packages': {
    description: 'Filter packages for Node runner',
    default: ['**'],
    type: 'array',
  },
  'filter.node.files': {
    description: 'Filter files for Node runner',
    default: ['**'],
    type: 'array',
  },
  exit: {
    description:
      'Force its own process to exit once it was finished executing all tests',
    default: false,
    type: 'boolean',
  },
  updateSnapshot: {
    description: 'Update snapshots',
    default: false,
    type: 'boolean',
    alias: 'u',
  },
  mocks: {
    description: 'Automagically mock modules',
    default: [['*.{scss,less,css}']],
    type: 'array',
  },
  'mocha.reporter': {
    description: 'Which reporter to use',
    default: undefined,
    type: 'string',
  },
  'mocha.bail': {
    description: 'Bails on failure',
    default: true,
    type: 'boolean',
  },
  'mocha.timeout': {
    description: 'Timeout',
    default: 2000,
    type: 'number',
  },
  'nyc.hookRequire': {
    description: 'Hook require',
    default: false,
    type: 'boolean',
  },
  'nyc.hookRunInContext': {
    description: 'Hook require',
    default: false,
    type: 'boolean',
  },
  'nyc.hookRunInThisContext': {
    description: 'Hook require',
    default: false,
    type: 'boolean',
  },
  'nyc.require': {
    description: 'Require path',
    default: [],
    type: 'array',
  },
  'nyc.include': {
    description: 'Include glob',
    default: [],
    type: 'array',
  },
  'nyc.exclude': {
    description: 'Exclude glob',
    default: DEFAULT_INSTRUMENT_EXCLUDE_PATTERN,
    type: 'array',
  },
  'nyc.sourceMap': {
    description: 'Sets if NYC should handle source maps.',
    default: false,
    type: 'boolean',
  },
  'nyc.instrumenter': {
    description: 'Sets which instrumenter to use',
    default: './lib/instrumenters/noop',
    type: 'string',
  },
  'nyc.tempDirectory': {
    description: 'Directory to output raw coverage information to',
    default: './coverage/.nyc_output',
    type: 'string',
  },
  'nyc.reporter': {
    description: 'Coverage reporter(s) to use',
    default: ['lcov', 'text-summary'],
    type: 'array',
  },
  'nyc.reportDir': {
    description: 'Directory to output coverage reports in',
    default: 'coverage',
    type: 'string',
  },
  interactive: {
    description: 'Run in interactive mode',
    default: false,
    type: 'boolean',
    alias: 'i',
  },
  warnings: {
    description: 'Log mock warnings to stderr',
    default: true,
    type: 'boolean',
  },
};
