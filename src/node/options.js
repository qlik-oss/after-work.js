module.exports = {
  config: {
    description: 'Path to config file',
    type: 'string',
    default: null,
    alias: 'c',
  },
  glob: {
    description: 'Glob pattern',
    default: ['test/**/*.spec.js'],
    type: 'array',
  },
  src: {
    description: 'Glob pattern for all source files',
    default: ['src/**/*.js'],
    type: 'array',
  },
  require: {
    description: 'Require path',
    default: [],
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
    default: ['src/**/*.js', 'test/**/*.spec.js'],
    type: 'array',
    alias: 'wg',
  },
  coverage: {
    description: 'Generate coverage',
    default: false,
    type: 'boolean',
  },
  exit: {
    description: 'Force its own process to exit once it was finished executing all tests',
    default: false,
    type: 'boolean',
  },
  'mocha.reporter': {
    description: 'Which reporter to use',
    default: undefined,
    type: 'string',
  },
  'mocha.bail': {
    description: 'Bail on fail?',
    default: true,
    type: 'boolean',
  },
  'mocha.timeout': {
    description: 'Timeout',
    default: undefined,
    type: 'number',
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
    default: ['**/coverage/**'],
    type: 'array',
  },
  'nyc.sourceMap': {
    description: 'Should nyc detect and handle source maps?',
    default: false,
    type: 'boolean',
  },
  'nyc.babel': {
    description: 'Sets up a preferred babel test environment\n e.g add `babel-register` to `nyc.require`\n `nyc.sourceMap=false`\n`nyc.instrument=./lib/instrumenters/noop`',
    default: true,
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
};
