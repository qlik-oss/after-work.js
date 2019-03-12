---
id: puppeteer-examples
title: Puppeteer
---

```javascript
describe('Puppeteer', () => {
  it('should say hello world', async () => {
    await page.goto(
      'http://localhost:9677/examples/puppeteer/test/hello.fix.html',
    );
    const container = await page.$('#container');
    const txt = await (await container.getProperty('textContent')).jsonValue();
    expect(txt).to.equal('hello world');
  });
  it.only('should be able to intercept', async () => {
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      if (/localhost:9677\/my\/fancy\/api/.test(interceptedRequest.url())) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'text/plain',
          body: 'Hello world intercepted!',
        });
        return;
      }
      interceptedRequest.continue();
    });
    await page.goto(
      'http://localhost:9677/examples/puppeteer/test/hello.fix.html',
    );
    await page.click('#container');
    const container = await page.$('#container');
    const txt = await (await container.getProperty('textContent')).jsonValue();
    expect(txt).to.equal('Hello world intercepted!');
  });
});
```

```javascript
describe('Puppeteer', () => {
  it('should say hello world', async () => {
    await page.goto(`file://${__dirname}/hello.fix.html`);
    const container = await page.$('#container');
    const txt = await (await container.getProperty('textContent')).jsonValue();
    expect(txt).to.equal('hello world');
  });
});
```

