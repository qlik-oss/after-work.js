const path = require('path');

module.exports = function initConfig() {
  return {
    multiCapabilities: [
      {
        name: 'desktop',
        browserName: 'chrome',
        directConnect: true,
        chromeOptions: {
          args: ['--window-size=1024,768'],
        },
      },
      {
        name: 'mobile',
        browserName: 'chrome',
        directConnect: true,
        chromeOptions: {
          args: ['--window-size=375,667'],
        },
      },
    ],
    specs: [path.resolve(__dirname, 'test/hello.spec.js')],
    'filter.protractor.files': ['**/examples/protractor/**'],
  };
};
