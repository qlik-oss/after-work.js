module.exports = {
  logLevel: {
    description: 'Log level for http server',
    default: 'silent',
    type: 'string',
  },
  port: {
    description: 'Port',
    default: 9676,
    type: 'number',
  },
  open: {
    description: 'Open browser',
    default: false,
    type: 'boolean',
  },
  glob: {
    description: 'Glob pattern',
    type: 'array',
    default: [],
  },
  coverage: {
    description: 'Generate coverage',
    type: 'boolean',
    default: false,
  },
  coverageConfig: {
    blackList: [],
  },
  phantomjs: {
    description: 'Run phantomjs',
    type: 'boolean',
    default: false,
  },
  chromeHeadless: {
    description: 'Run chrome headless',
    type: 'boolean',
    default: false,
  },
  singleRun: {
    description: 'Run once',
    type: 'boolean',
    default: false,
  },
  config: {
    description: 'Path to config file',
    type: 'string',
    demandOption: true,
  },
  path: {
    description: 'Path to require.js lib',
    type: 'string',
    demandOption: true,
  },
  main: {
    description: 'Path to require.js main entry file',
    type: 'string',
    demandOption: true,
  },
};
