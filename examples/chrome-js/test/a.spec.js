import getA from '../src/a';

describe('chrome-js A', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
