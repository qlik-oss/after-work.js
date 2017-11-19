import { expect } from 'chai';
import getB from './b';

describe('es2015 - b', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
