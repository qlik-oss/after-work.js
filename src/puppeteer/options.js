module.exports = {
  config: {
    description: 'Path to config file',
    type: 'string',
    default: 'aw.config.js',
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
    default: false,
    type: 'boolean',
  },
};
