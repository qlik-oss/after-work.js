describe('Rendering', () => {
  it('should', async () => {
    await browser.get('/examples/protractor/test/rendering.fix.html');
    await expect(
      await browser.takeImageOf({ selector: '#container' }),
    ).to.matchImageOf('container');
  });
});
