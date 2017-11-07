'use strict';

define(['chai', './a'], function (chai, a) {
  var expect = chai.expect;
  describe('A', function () {
    it('should return "a"', function () {
      expect(a).to.equal('a');
    });
  });
});
