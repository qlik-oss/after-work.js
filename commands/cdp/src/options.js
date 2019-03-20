const {
  packages,
  TEST_GLOB,
  SRC_GLOB,
  WATCH_GLOB,
  DEFAULT_SRC_EXT_PATTERN,
  DEFAULT_TEST_EXT_PATTERN,
  DEFAULT_INSTRUMENT_EXCLUDE_PATTERN,
  DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
} = require('@after-work.js/utils');

module.exports = {
  presetEnv: {
    description:
      'Preset the test environment with Sinon, Chai, Sinon-Chai, Chai subset',
    default: true,
    type: 'boolean',
  },
  config: {
    description: 'Path to config file',
    type: 'string',
    default: null,
    alias: 'c',
  },
  url: {
    description: 'Url to html file',
    type: 'string',
    default: null,
  },
  scope: {
    description: 'Scope to package',
    default: [],
    choices: packages,
    type: 'array',
    alias: 's',
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
    hidden: true,
  },
  srcExt: {
    description: 'Test file extensions glob pattern',
    default: DEFAULT_SRC_EXT_PATTERN,
    type: 'string',
    hidden: true,
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
    description: 'Generate coverage?',
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
  'transform.typescript.config': {
    description: 'Typescript config file',
    default: 'tsconfig.json',
    type: 'string',
  },
  'transform.typescript.babelOptions': {
    description: 'Typescript babel options',
    default: {},
    type: 'object',
  },
  'transform.include': {
    description: 'Transform files with babel?',
    default: [],
    type: 'array',
  },
  'transform.exclude': {
    description: 'Exclude glob',
    default: [],
    type: 'array',
  },
  'transform.defaultExclude': {
    description: 'Default exclude glob',
    default: DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
    type: 'array',
  },
  'mocha.bail': {
    description: 'Bails on failure',
    default: true,
    type: 'boolean',
  },
  'mocha.ui': {
    description: 'Test interface',
    default: 'bdd',
    type: 'string',
  },
  'mocha.timeout': {
    description: 'Timeout',
    default: 2000,
    type: 'number',
  },
  'mocha.useColors': {
    description: 'Use colors in output',
    default: true,
    type: 'boolean',
  },
  'mocha.reporter': {
    description: 'Reporter',
    default: 'min',
    type: 'string',
  },
  'client.port': {
    description: 'Chrome port',
    default: 9222,
    type: 'number',
  },
  'chrome.launch': {
    description: 'Launch Chrome',
    default: true,
    type: 'boolean',
  },
  'chrome.devtools': {
    description: 'Open Chrome with dev tools',
    default: false,
    type: 'boolean',
  },
  'chrome.port': {
    description: 'Chrome port',
    default: 9222,
    type: 'number',
  },
  'chrome.chromeFlags': {
    description: 'Chrome flags',
    default: ['--headless', '--disable-gpu', '--allow-file-access-from-files'],
    type: 'array',
  },
  'http.port': {
    description: 'Listen on this http port',
    default: 9676,
    type: 'number',
  },
  'http.root': {
    description: 'Root folders to serve',
    default: ['./'],
    type: 'array',
  },
  'http.rewrite': {
    description: 'Rewrite url(s)',
    default: {},
    type: 'object',
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
  'nyc.exclude': {
    description: 'Exclude glob',
    default: DEFAULT_INSTRUMENT_EXCLUDE_PATTERN,
    type: 'array',
  },
  interactive: {
    description: 'Run in interactive mode',
    default: false,
    type: 'boolean',
    alias: 'i',
  },
  'filter.chrome.packages': {
    description: 'Filter packages for Chrome runner',
    default: ['**'],
    type: 'array',
  },
  'filter.chrome.files': {
    description: 'Filter files for Chrome runner',
    default: ['**'],
    type: 'array',
  },
};
