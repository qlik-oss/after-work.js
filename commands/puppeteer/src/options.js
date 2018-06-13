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
};
