const {
  packages,
  DEFAULT_TEST_EXT_PATTERN,
  TEST_GLOB,
  SRC_GLOB,
  WATCH_GLOB,
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
    coerce: opt => [...opt, ...WATCH_GLOB],
  },
  coverage: {
    description: 'Generate coverage',
    default: false,
    type: 'boolean',
  },
  launch: {
    description: 'Launch or connect to Chrome',
    default: true,
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
  'filter.puppeteer.packages': {
    description: 'Filter packages for Puppeteer runner',
    default: ['**'],
    type: 'array',
  },
  'filter.puppeteer.files': {
    description: 'Filter files for Puppeteer runner',
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
    default: undefined,
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
    default: ['**/coverage/**', '**/dist/**', '**/*.spec.{js,ts}'],
    type: 'array',
  },
  'nyc.sourceMap': {
    description: 'Sets if NYC should handle source maps.',
    default: false,
    type: 'boolean',
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
  'chrome.headless': {
    description: 'Run chrome headless',
    default: true,
    type: 'boolean',
  },
  'chrome.args': {
    description: 'Chrome flags',
    default: [],
    type: 'array',
  },
  'chrome.stable': {
    description: 'Use stable Chrome',
    default: true,
    type: 'boolean',
  },
  'http.port': {
    description: 'Listen on this http port',
    default: 9677,
    type: 'number',
  },
  httpServer: {
    description: 'Configure a http server',
    default: false,
    type: 'boolean',
  },
};
