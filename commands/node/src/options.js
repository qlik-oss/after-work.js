module.exports = {
  require: {
    description: 'Require path',
    default: [],
    type: 'array',
  },
  exit: {
    description: 'Force its own process to exit once it was finished executing all tests',
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
};
