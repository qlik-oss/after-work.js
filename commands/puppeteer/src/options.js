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
  browserWSEndpoint: {
    description: 'Connect to external chrome WS endpoint (`ws://localhost:3000`)',
    type: 'string',
    default: null,
  },
  'mocha.enableTimeouts': {
    description: 'Enable timeouts',
    default: false,
    type: 'boolean',
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
};
