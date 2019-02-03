/* global page */
describe('Puppeteer', () => {
  it('should say hello world', async () => {
    await page.goto(
      'http://localhost:9677/examples/puppeteer/test//hello.fix.html',
    );
    const container = await page.$('#container');
    const txt = await (await container.getProperty('textContent')).jsonValue();
    expect(txt).to.equal('hello world');
  });
});
