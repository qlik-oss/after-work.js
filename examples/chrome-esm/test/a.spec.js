// The .js is needed since that's what the browser will request and according to spec
import getA from "../src/a.js"; // eslint-disable-line import/extensions

describe("chrome-esm A", () => {
  it('should return "a"', () => {
    expect(getA()).to.equal("a");
  });
});
