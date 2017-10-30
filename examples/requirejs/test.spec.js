define(['chai', './test'], (chai, test) => {
  const { expect } = chai;
  describe('Test', () => {
    it('should work', () => {
      expect(true).to.equal(true);
    });
    it('should return "test"', () => {
      expect(test).to.equal('test');
    });
  });
});
