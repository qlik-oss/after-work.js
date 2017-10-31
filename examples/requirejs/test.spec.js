define(['chai', './test'], (chai, test) => {
  const { expect } = chai;
  describe('Test', () => {
    it('should work', () => {
      debugger;
      expect(true).to.equal(true);
    });
    it('should return "test"', () => {
      expect(test).to.equal('test');
    });
  });
});
