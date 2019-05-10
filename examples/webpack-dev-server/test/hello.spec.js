describe('Webpack dev server Puppeteer', () => {
  it('should say hello world', async () => {
    await page.goto('http://0.0.0.0:8080/examples/webpack-dev-server/');
    const container = await page.$('#container');
    const txt = await (await container.getProperty('textContent')).jsonValue();
    expect(txt).to.equal('hello world');
  });
});
