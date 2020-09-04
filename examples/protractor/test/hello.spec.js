describe("Protractor", () => {
  it("should say hello world", async () => {
    await browser.get("/examples/protractor/test/hello.fix.html");
    const container = await element(by.id("container"));
    const txt = await container.getText();
    expect(txt).to.equal("hello world");
  });
});
