import { expect } from 'chai';
import Dummy from '../src/dummy';

describe('Dummy', () => {
  it('should work with typescript', () => {
    const dummy = new Dummy();
    expect(dummy.publicMethod()).to.equal('dummy');
  });
});
