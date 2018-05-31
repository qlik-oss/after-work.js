import { expect } from 'chai';
import getB from '../src/b';

describe('B', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
