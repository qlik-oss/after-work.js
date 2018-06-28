const path = require('path');

module.exports = function initConfig() {
  return {
    artifactsPath: 'examples/protractor/test/__artifacts__',
    capabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['--disable-gpu'],
      },
    },
    specs: [path.resolve(__dirname, 'test/*.spec.js')],
  };
};
