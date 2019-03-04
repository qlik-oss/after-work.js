const path = require('path');

module.exports = function initConfig() {
  return {
    baseUrl: 'http://web-server/',
    directConnect: false,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    capabilities: {
      name: 'desktop',
      browserName: 'chrome',
      chromeOptions: {
        args: ['--window-size=1024,768'],
      },
    },
    specs: [path.resolve(__dirname, 'test/rendering/rendering.spec.js')],
    'filter.protractor.files': ['**/examples/protractor/**'],
    artifactsPath: 'test/__artifacts__',
    // Protractor mochaOpts
    mochaOpts: {
      reporterOptions: {
        name: '@after-work.js',
        version: 'next',
      },
    },
  };
};
