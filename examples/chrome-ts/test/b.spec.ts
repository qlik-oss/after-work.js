import { expect } from 'chai';
import getB from '../src/b';

describe('chrome-ts B', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
