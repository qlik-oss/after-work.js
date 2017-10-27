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
    default: ['--allow-file-access-from-files'],
    type: 'array',
  },
};
