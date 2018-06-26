module.exports = {
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
  glob: {
    description: 'Glob pattern',
    default: ['test/**/*.spec.js'],
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
  coverage: {
    description: 'Generate coverage?',
    default: false,
    type: 'boolean',
  },
  babelOptions: {
    description: '',
    default: {
      ignore: [],
      configFile: './babel.config.js',
    },
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
    default: [
      '**/coverage/**',
      '**/external/**',
      '**/autogenerated/**',
      '**/*.(html|css|json|txt|ttf|woff|svg)',
      '**/*require*.js',
      '**/*sinon*.js',
      '**/*chai*.js',
    ],
    type: 'array',
  },
  'instrument.include': {
    description: 'Instrument files with babel?',
    default: [],
    type: 'array',
  },
  'instrument.exclude': {
    description: 'Exclude glob',
    default: [],
    type: 'array',
  },
  'instrument.defaultExclude': {
    description: 'Exclude glob',
    default: [
      '**/coverage/**',
      '**/external/**',
      '**/autogenerated/**',
      '**/*.(html|css|json|txt|ttf|woff|svg)',
      '**/*require*.js',
      '**/*sinon*.js',
      '**/*chai*.js',
      '**/*.spec.{js,ts}',
    ],
    type: 'array',
  },
  'mocha.bail': {
    description: 'Bail on fail?',
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
    description: 'Use colors',
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
    description: 'Launch Chrome?',
    default: true,
    type: 'boolean',
  },
  'chrome.devtools': {
    description: 'Open Chrome with dev tools?',
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
};
