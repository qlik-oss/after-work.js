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
