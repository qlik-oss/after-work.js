---
id: protractor-examples
title: Protractor
---

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

