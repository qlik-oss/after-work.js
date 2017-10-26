require('../../src/env');

describe('Environment', () => {
  describe('chai extensions', () => {
    it('chai-subset should be used', () => {
      const obj = {
        a: 'b',
        c: {
          foo: 'bar',
        },
      };
      expect(obj).to.containSubset({
        c: {
          foo: 'bar',
        },
      });
    });

    it('chai-as-promised should be used', () => expect(Promise.resolve(1 + 1)).to.eventually.equal(2));
  });
});
