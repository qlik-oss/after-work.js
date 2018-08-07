const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const jimp = require('jimp');
const plugin = require('../src');

describe('chai-plugin-screenshot', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('fileExists', () => {
    it('should return true if file exists', () => {
      sandbox.stub(fs, 'lstat').callsArgWith(1, false);
      return expect(plugin.fileExists('foo')).to.eventually.equal(true);
    });

    it("should return false if file doesn't exist", () => {
      sandbox.stub(fs, 'lstat').callsArgWith(1, true);
      return expect(plugin.fileExists('foo')).to.eventually.equal(false);
    });
  });

  describe('writeImage', () => {
    let img;

    beforeEach(() => {
      img = { write: sandbox.stub() };
    });

    it('should write an image to a file', () => {
      img.write.callsArgWith(1);
      return expect(plugin.writeImage(img, 'foo')).to.eventually.be.fulfilled.and.be.an('undefined');
    });

    it("should reject if image file couldn't be created", () => {
      img.write.callsArgWith(1, 'error');
      return expect(plugin.writeImage(img, 'foo')).to.eventually.be.rejectedWith('error');
    });
  });

  describe('compare', () => {
    let jimpRead;
    let jimpDistance;
    let jimpDiff;

    beforeEach(() => {
      jimpRead = sandbox.stub(jimp, 'read');
      jimpDistance = sandbox.stub(jimp, 'distance');
      jimpDiff = sandbox.stub(jimp, 'diff');
    });

    it('should be equal if the tolerance is met', () => {
      const distance = 0;
      const diffImg = {};
      const percent = 0;
      jimpRead.returns(Promise.resolve({}));
      jimpDistance.returns(distance);
      jimpDiff.returns({ image: diffImg, percent });

      return expect(plugin.compare('baseline', 'regression', 0)).to.eventually.be.fulfilled.and.deep.equal({
        diffImg,
        isEqual: true,
        equality: `distance: ${distance}, percent: ${percent}`,
      });
    });

    it("should not be equal if the tolerance isn't met", () => {
      const distance = 0.1;
      const diffImg = {};
      const percent = 0;
      jimpRead.returns(Promise.resolve({}));
      jimpDistance.returns(distance);
      jimpDiff.returns({ image: diffImg, percent });

      return expect(plugin.compare('baseline', 'regression', 0)).to.eventually.be.fulfilled.and.deep.equal({
        diffImg,
        isEqual: false,
        equality: `distance: ${distance}, percent: ${percent}`,
      });
    });
  });

  describe('matchImageOf', () => {
    let chaiCtx;
    let matchImageOf;
    let fileExists;
    let writeImage;
    let compare;
    let toImage;
    let mkdir;
    const baselinePath = 'artifacts/baseline/';
    const baseline = `${baselinePath}id-windows-nt-chrome.png`;
    const regressionPath = 'artifacts/regression/';
    const regression = `${regressionPath}id-windows-nt-chrome.png`;
    const diffPath = 'artifacts/diff/';
    const diff = `${diffPath}id-windows-nt-chrome.png`;
    const img = {};

    beforeEach(() => {
      sandbox.stub(path, 'resolve').callsFake((...args) => args.join('/').replace('//', '/'));
      fileExists = sandbox.stub(plugin, 'fileExists');
      writeImage = sandbox.stub(plugin, 'writeImage');
      compare = sandbox.stub(plugin, 'compare');
      toImage = sandbox.stub(plugin, 'toImage');
      chaiCtx = {
        _obj: Promise.resolve({ // takeImageOf context
          img, browserName: 'chrome', artifactsPath: 'artifacts', platform: 'windows-nt',
        }),
        assert: sinon.stub(),
      };
      matchImageOf = plugin.matchImageOf.bind(chaiCtx);
      sandbox.stub(process, 'cwd').returns('foo');
      mkdir = sandbox.stub(mkdirp, 'sync');

      toImage.returns(Promise.resolve(img));
    });

    it("should write baseline if it's not existing", () => {
      fileExists.returns(Promise.resolve(false));
      writeImage.returns(Promise.resolve());
      return matchImageOf('id').then(() => {
        expect(writeImage).to.have.been.calledWith({}, baseline);
      });
    });

    it('should compare and resolve if considered equal to baseline', () => {
      fileExists.returns(Promise.resolve(true));
      writeImage.returns(Promise.resolve());
      compare.returns(Promise.resolve({ equality: 0, isEqual: true }));
      return matchImageOf('id').then((comparison) => {
        expect(comparison).to.deep.equal({ equality: 0, isEqual: true });
      });
    });

    it('should reject if not considered equal to baseline', () => {
      const diffImg = {};
      fileExists.returns(Promise.resolve(true));
      writeImage.returns(Promise.resolve());
      compare.returns(Promise.resolve({ isEqual: false, diffImg }));
      return matchImageOf('id').then(() => {
        expect(writeImage.callCount).to.equal(2);
        expect(writeImage.firstCall).to.have.been.calledWithExactly(img, regression);
        expect(writeImage.secondCall).to.have.been.calledWithExactly(diffImg, diff);
      });
    });

    it('should create the default baseline folders', () => {
      fileExists.returns(Promise.resolve(false));
      writeImage.returns(Promise.resolve());
      return matchImageOf('id').then(() => {
        expect(mkdir.callCount).to.equal(1);
        expect(mkdir.firstCall).to.have.been.calledWithExactly('artifacts/baseline');
      });
    });

    it('should create the default regression and diff folders', () => {
      fileExists.returns(Promise.resolve(true));
      writeImage.returns(Promise.resolve());
      compare.returns(Promise.resolve({ equality: 0, isEqual: false }));

      return matchImageOf('id').then(() => {
        expect(mkdir.callCount).to.equal(2);
        expect(mkdir.firstCall).to.have.been.calledWithExactly('artifacts/regression');
        expect(mkdir.secondCall).to.have.been.calledWithExactly('artifacts/diff');
      });
    });

    it('should create the baseline folders from parameter string', () => {
      const folder = 'foo/bar';
      fileExists.returns(Promise.resolve(false));
      writeImage.returns(Promise.resolve());
      return matchImageOf('id', folder).then(() => {
        expect(mkdir.callCount).to.equal(1);
        expect(mkdir.firstCall).to.have.been.calledWithExactly(baselinePath + folder);
      });
    });

    it('should create the baseline folders from options object', () => {
      chaiCtx = {
        _obj: Promise.resolve({}), // Change context something else than takeImageOf
        assert: sinon.stub(),
      };
      matchImageOf = plugin.matchImageOf.bind(chaiCtx);

      fileExists.returns(Promise.resolve(false));
      writeImage.returns(Promise.resolve());
      return matchImageOf('id', { artifactsPath: 'testing', folder: 'test' }).then(() => {
        expect(mkdir.callCount).to.equal(1);
        expect(mkdir.firstCall).to.have.been.calledWithExactly('testing/baseline/test');
      });
    });
  });
});
