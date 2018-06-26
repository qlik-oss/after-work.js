import { expect } from 'chai';
import getA from '../src/a';

describe('A', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
