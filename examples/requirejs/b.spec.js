'use strict';

define(['chai', './b'], function (chai, a) {
  var expect = chai.expect;
  describe('B', function () {
    it('should return "b"', function () {
      expect(a).to.equal('b');
    });
  });
});
