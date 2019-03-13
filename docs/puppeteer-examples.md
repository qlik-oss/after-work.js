---
id: puppeteer-examples
title: Puppeteer
---

```html
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
    <div id="container" onclick="getData();">hello world</div>
    <script>
      window.getData = () => {
        const container = document.querySelector("#container");
        fetch("http://localhost:9677/my/fancy/api")
          .then(response => {
            response.text().then(txt => (container.innerHTML = txt));
          })
          .catch(err => {
            container.innerHTML = err.toString();
          });
      };
    </script>
  </body>
</html>
```

**[examples/puppeteer/test/hello.fix.html](https://github.com/qlik-oss/after-work.js/tree/master/examples/puppeteer/test/hello.fix.html)**

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

**[examples/puppeteer/test/hello-http.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/puppeteer/test/hello-http.spec.js)**

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

**[examples/puppeteer/test/hello.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/puppeteer/test/hello.spec.js)**

