module.exports = {
  config: {
    description: 'Path to config file',
    type: 'string',
    default: 'aw.config.js',
    alias: 'c',
  },
  glob: {
    description: 'Glob pattern',
    type: 'string',
    default: [],
  },
  coverage: {
    description: 'Generate coverage',
    type: 'boolean',
    default: false,
  },
  require: {
    description: 'Require path',
    default: [],
    type: 'array',
  },
};
