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
    default: ['src/**/*.{js, ts}'],
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
    default: ['src/**/*.{js,ts}', 'test/**/*.{js,ts}'],
    type: 'array',
    alias: 'wg',
  },
  only: {
    description: 'Only run last changed tests',
    default: false,
    type: 'boolean',
    alias: 'o',
  },
  coverage: {
    description: 'Generate coverage',
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
    default: ['**/coverage/**'],
    type: 'array',
  },
  'nyc.sourceMap': {
    description: 'Should nyc detect and handle source maps?',
    default: false,
    type: 'boolean',
  },
  'nyc.babel': {
    description: 'Sets up a preferred babel test environment e.g add `babel-register` to `nyc.require` `nyc.sourceMap=false` and `nyc.instrument=./lib/instrumenters/noop`',
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
