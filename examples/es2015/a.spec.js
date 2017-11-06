import chai from 'chai';
import getA from './a';

const { expect } = chai;

describe('es2015 - a', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
