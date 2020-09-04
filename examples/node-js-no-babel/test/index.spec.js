const getAzure = require('../src');

describe('Azure', () => {
  it('should work', () => {
    expect(getAzure()).to.equal('azure');
  });
});
