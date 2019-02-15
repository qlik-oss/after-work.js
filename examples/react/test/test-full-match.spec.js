/* global aw */

describe('Full match', () => {
  it('can mock', () => {
    const [{ default: fullMatch }] = aw.mock(
      [['@foo/bar', () => 'bar']],
      ['../src/full-match'],
    );
    expect(fullMatch).to.equal('bar');
  });
});
