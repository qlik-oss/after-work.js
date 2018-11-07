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
  launch: {
    description: 'Launch or connect to Chrome',
    default: true,
    type: 'boolean',
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
