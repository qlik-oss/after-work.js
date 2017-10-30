module.exports = {
  config: {
    description: 'Path to config file',
    type: 'string',
    default: 'aw.config.js',
  },
  url: {
    description: 'Url to html file',
    type: 'string',
    demandOption: true,
  },
  glob: {
    description: 'Glob pattern',
    default: ['test/**/*.spec.js'],
    type: 'array',
  },
  'chrome.chromeFlags': {
    description: 'Chrome flags',
    default: ['--headless', '--disable-gpu', '--allow-file-access-from-files'],
    type: 'array',
  },
  httpPort: {
    description: 'Listen on this http port',
    default: 9676,
    type: 'number',
  },
  coverage: {
    description: 'Generate coverage?',
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
    default: ['**/coverage/**', '**/*.(html|css)', '**/*.spec.(js|ts)'],
    type: 'array',
  },
  'nyc.sourceMap': {
    description: 'Should nyc detect and handle source maps?',
    default: true,
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
    default: ['text', 'lcov', 'text-summary'],
    type: 'array',
  },
  'nyc.reporterDir': {
    description: 'Directory to output coverage reports in',
    default: 'coverage',
    type: 'string',
  },
};
