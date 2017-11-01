define(['chai', './a'], (chai, a) => {
  const { expect } = chai;
  describe('A', () => {
    it('should return "a"', () => {
      expect(a).to.equal('a');
    });
  });
});
