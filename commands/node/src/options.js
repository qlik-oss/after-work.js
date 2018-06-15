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
  babel: {
    description: '',
    default: true,
    type: 'boolean',
  },
  babelOptions: {
    description: '',
    default: {
      ignore: [],
      configFile: './babel.config.js',
    },
  },
  presetEnv: {
    description: 'Preset environment with Sinon and Chai',
    default: true,
    type: 'boolean',
  },
  mocks: {
    description: 'Automagically mock modules',
    default: [['**/*.{scss, less, css}', '{}']],
    type: 'array',
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
    description: 'Should nyc detect and handle source maps?',
    default: false,
    type: 'boolean',
  },
  'nyc.babel': {
    description: 'Sets up a preferred babel test environment\n e.g add `babel-register` to `nyc.require`\n `nyc.sourceMap=false`\n`nyc.instrument=./lib/instrumenters/noop`',
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
};
