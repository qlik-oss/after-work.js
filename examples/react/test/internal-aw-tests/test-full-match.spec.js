const [{ default: fullMatch }] = aw.mock(
  [['@foo/bar', () => 'bar']],
  ['../../src/full-match'],
);

describe('Full match', () => {
  it('can mock', () => {
    expect(fullMatch).to.equal('bar');
  });
});
