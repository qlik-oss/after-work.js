---
id: protractor-examples
title: Protractor
---

```javascript
<html lang="en">

<head>
  <title>Test</title>
  <meta charset="utf-8">
  <base href="/">
  <style>
    #container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>

<body>
  <div id="container">
    hello world
  </div>
</body>

</html>
```

**[examples/protractor/test/hello.fix.html](https://github.com/qlik-oss/after-work.js/tree/master/examples/protractor/test/hello.fix.html)**

```javascript
<html lang="en">
  <head>
    <title>Test</title>
    <meta charset="utf-8" />
    <base href="/" />
    <style>
      #container {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>

  <body>
    <div id="container" style="background: red">
      hepp
    </div>
  </body>
</html>
```

**[examples/protractor/test/rendering/rendering.fix.html](https://github.com/qlik-oss/after-work.js/tree/master/examples/protractor/test/rendering/rendering.fix.html)**

```javascript
describe('Protractor', () => {
  it('should say hello world', async () => {
    await browser.get('/examples/protractor/test/hello.fix.html');
    const container = await element(by.id('container'));
    const txt = await container.getText();
    expect(txt).to.equal('hello world');
  });
});
```

**[examples/protractor/test/hello.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/protractor/test/hello.spec.js)**

```javascript
describe('Rendering', () => {
  it('should', async () => {
    await browser.get('/examples/protractor/test/rendering/rendering.fix.html');
    await browser.wait(
      protractor.ExpectedConditions.visibilityOf($('#container')),
      1000,
      'wh00t',
    );
    await expect(
      await browser.takeImageOf({ selector: '#container' }),
    ).to.matchImageOf('container');
  });
});
```

**[examples/protractor/test/rendering/rendering.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/protractor/test/rendering/rendering.spec.js)**

```javascript
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
```

**[examples/protractor/aw.config.multi.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/protractor/aw.config.multi.js)**

```javascript
const path = require('path');

module.exports = function initConfig() {
  return {
    baseUrl: 'http://localhost:8080/',
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
    artifactsPath: 'test/__artifacts__',
    // Protractor mochaOpts
    mochaOpts: {
      reporterOptions: {
        name: '@after-work.js',
        version: 'next',
      },
    },
    configureHttpServer: () => ({
      http: {
        port: 8080,
      },
    }),
  };
};
```

**[examples/protractor/aw.config.rendering.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/protractor/aw.config.rendering.js)**

