import getB from './b';
import { expect } from 'chai';


describe('B', function () {
  it('should return "b"', function () {
    expect(getB()).to.equal('b');
  });
});
