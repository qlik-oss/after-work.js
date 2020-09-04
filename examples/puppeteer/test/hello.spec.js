describe("Puppeteer", () => {
  it("should say hello world", async () => {
    await page.goto(`file://${__dirname}/hello.fix.html`);
    const container = await page.$("#container");
    const txt = await (await container.getProperty("textContent")).jsonValue();
    expect(txt).to.equal("hello world");
  });
});
