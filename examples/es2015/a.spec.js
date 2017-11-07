import chai from 'chai';
import getA from './a';

const { expect } = chai;

describe('es2015 - a', () => {
  it('should return "a"', () => {
    debugger;
    expect(getA()).to.equal('a');
  });
});
