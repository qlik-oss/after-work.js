---
id: protractor
title: Protractor
---

## [Protractor](https://github.com/angular/protractor) config

If you are using protractor for running test the configuration has to be according to the protractor configuration. A [**base configuration**](../src/protractor/config.js) will be provided by `after-work.js` but this can be extended as shown below.

## Override default configs

aw.config.js
```
'use strict';

const path = require('path');
const extend = require('extend');
const util = require('util');

module.exports = function initConfig(baseConfig) {
  const config = {
    baseUrl: 'http://server:1337/',
    artifactsPath: 'test/integration/__artifacts__',
    seleniumAddress: 'http://localhost:4446/wd/hub',
    capabilities: {
      browserName: 'chrome',
      unexpectedAlertBehaviour: 'accept',
      chromeOptions: {
        args: ['--disable-infobars'],
      },
    },
    mochaOpts: {
      bail: true,
    },
    multiCapabilities: [],
    specs: [
      path.resolve(__dirname, './**/*.spec.js'),
    ],
    beforeLaunch() { },
    onComplete() {
      return browser.manage().logs().get('browser').then((browserLog) => {
        console.log(`log: ${util.inspect(browserLog)}`); //eslint-disable-line
      });
    },
    configureHttpServer() {
      return {
        http: {
          rewrite: {
            '/fixtures/(.*)': 'packages/foo/test/integration/$1',
          }
        }
      };
    },
  };
  return extend(true, baseConfig, config);
};
```

## Protractor plugins

There are two Protractor plugins developed and bundled together with after-work.js:

* **Screenshooter**: enables you to take a screenshot of an element and compare it to a saved baseline using an expect statement

```js
it('should match baseline', async () => {
  expect( await browser.takeImageOf( <element> ) ).to.matchImageOf( <baseline> );
});
```

* **Custom Reporter**: a mocha reporter that saves the test results into JSON. A HTML report is generated after the test is completed with the ability to show the different states of a rendering (Screenshooter) test.
