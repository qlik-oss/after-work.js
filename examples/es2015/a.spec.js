import { expect } from 'chai';
import getA from './a';

describe('es2015 - a', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
