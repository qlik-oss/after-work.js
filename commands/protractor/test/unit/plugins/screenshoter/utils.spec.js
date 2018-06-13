const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const jimp = require('jimp');
const utils = require('../../../../src/plugins/screenshoter/utils');

describe('Screenshoter Utils', () => {
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
      return expect(utils.fileExists('foo')).to.eventually.equal(true);
    });

    it("should return false if file doesn't exist", () => {
      sandbox.stub(fs, 'lstat').callsArgWith(1, true);
      return expect(utils.fileExists('foo')).to.eventually.equal(false);
    });
  });

  describe('removeFile', () => {
    it('should resolve if the file could be removed', () => {
      sandbox.stub(fs, 'unlink').callsArgWith(1, false);
      return expect(utils.removeFile('foo')).to.eventually.be.fulfilled.and.be.an('undefined');
    });

    it("should reject if the file couldn't be removed", () => {
      sandbox.stub(fs, 'unlink').callsArgWith(1, 'error');
      return expect(utils.removeFile('foo')).to.eventually.be.rejectedWith('error');
    });
  });

  describe('removeFiles', () => {
    it('should resolve if files were removed', () => {
      sandbox.stub(utils, 'removeFile').returns(Promise.resolve());
      return expect(utils.removeFiles('foo', 'bar', 'baz')).to.eventually.be.fulfilled.and.be.an('array');
    });

    it('should reject if not all files were removed', () => {
      const error = new Error('error');
      sandbox.stub(utils, 'removeFile').returns(Promise.reject(error));
      return expect(utils.removeFiles('foo', 'bar', 'baz')).to.eventually.be.rejectedWith(error);
    });
  });

  describe('writeImage', () => {
    let img;

    beforeEach(() => {
      img = { write: sandbox.stub() };
    });

    it('should write an image to a file', () => {
      img.write.callsArgWith(1);
      return expect(utils.writeImage(img, 'foo')).to.eventually.be.fulfilled.and.be.an('undefined');
    });

    it("should reject if image file couldn't be created", () => {
      img.write.callsArgWith(1, 'error');
      return expect(utils.writeImage(img, 'foo')).to.eventually.be.rejectedWith('error');
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

      return expect(utils.compare('baseline', 'regression', 0)).to.eventually.be.fulfilled.and.deep.equal({
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

      return expect(utils.compare('baseline', 'regression', 0)).to.eventually.be.fulfilled.and.deep.equal({
        diffImg,
        isEqual: false,
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

      return expect(utils.compare('baseline', 'regression', 0)).to.eventually.be.fulfilled.and.deep.equal({
        diffImg,
        isEqual: false,
        equality: `distance: ${distance}, percent: ${percent}`,
      });
    });

    it('should reject with error', () => {
      jimpRead.returns(Promise.reject(new Error('error')));
      expect(utils.compare('baseline', 'regression', 0)).to.eventually.be.rejected.and.have.property('message', 'error');
    });
  });

  describe('getBoundingClientRect', () => {
    let querySelector;
    let getBoundingClientRect;
    const Element = function Element() { };

    beforeEach(() => {
      querySelector = sandbox.stub();
      getBoundingClientRect = sandbox.stub();
      global.document = { querySelector };
      global.Element = Element;
      global.window = { devicePixelRatio: 2 };
    });

    afterEach(() => {
      delete global.document;
      delete global.Element;
      delete global.window;
    });

    it('should throw for invalid selector', () => {
      expect(utils.getBoundingClientRect.bind(utils)).to.throw();
    });

    it('should return rect for valid selector', () => {
      const rect = {
        left: 10, top: 20, width: 30, height: 40,
      };
      const cbRect = {
        left: 10, top: 20, width: 30, height: 40, ratio: 2,
      };
      const cb = sandbox.stub();
      getBoundingClientRect.returns(rect);
      const o = { getBoundingClientRect: { value: getBoundingClientRect } };
      const elem = Object.create(Element.prototype, o);
      querySelector.returns(elem);
      utils.getBoundingClientRect('foo', cb);
      expect(cb).to.have.been.calledWithExactly(cbRect);
    });
  });

  describe('takeImageOf', () => {
    let browser;
    let crop;

    const Capabilities = new Map();
    Capabilities.set('browserName', 'chrome');
    Capabilities.set('platform', 'windows-nt');

    beforeEach(() => {
      browser = {
        executeAsyncScript: sandbox.stub().returns(Promise.resolve({
          left: 200,
          top: 100,
          width: 200,
          height: 100,
        })),
        takeScreenshot: sandbox.stub().returns(Promise.resolve('foo')),
        getCapabilities: sandbox.stub().returns(Promise.resolve(Capabilities)),
      };
      crop = sandbox.stub();
      sandbox.stub(jimp, 'read').returns(Promise.resolve({ crop }));
    });

    it('should resolve if it was possible to take an image with selector', () => utils.takeImageOf(browser, { selector: 'my-selector' }).then((result) => {
      expect(crop).to.have.been.calledWith(200, 100, 200, 100);
      expect(result.rect).to.deep.equal({
        top: 100, left: 200, width: 200, height: 100,
      });
      expect(result.browserName).to.equal('chrome');
    }));

    it('should resolve if it was possible to take an image with default selector', () => utils.takeImageOf(browser, {}).then((result) => {
      expect(result.rect).to.deep.equal({
        top: 100, left: 200, width: 200, height: 100,
      });
      expect(result.browserName).to.equal('chrome');
      expect(result.platform).to.equal('windows-nt');
    }));

    it('should add offset to the rect used for cropping', () => utils.takeImageOf(browser, {
      selector: 'my-selector', offsetX: -5, offsetY: -5, offsetWidth: 5, offsetHeight: 5,
    }).then((result) => {
      expect(crop).to.have.been.calledWith(195, 95, 205, 105);
      expect(result.rect).to.deep.equal({
        top: 95, left: 195, width: 205, height: 105,
      });
      expect(result.browserName).to.equal('chrome');
    }));
  });

  describe('matchImageOf', () => {
    let chaiCtx;
    let matchImageOf;
    let fileExists;
    let writeImage;
    let compare;
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
      fileExists = sandbox.stub(utils, 'fileExists');
      writeImage = sandbox.stub(utils, 'writeImage');
      compare = sandbox.stub(utils, 'compare');
      chaiCtx = {
        _obj: Promise.resolve({
          img, browserName: 'chrome', artifactsPath: 'artifacts', platform: 'windows-nt',
        }),
        assert: sinon.stub(),
      };
      matchImageOf = utils.matchImageOf.bind(chaiCtx);
      sandbox.stub(process, 'cwd').returns('foo');
      mkdir = sandbox.stub(mkdirp, 'sync');
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

    it('should create the default artifacts folders', () => {
      fileExists.returns(Promise.resolve(false));
      writeImage.returns(Promise.resolve());
      return matchImageOf('id').then(() => {
        expect(mkdir.callCount).to.equal(3);
        expect(mkdir.firstCall).to.have.been.calledWithExactly(baselinePath);
        expect(mkdir.secondCall).to.have.been.calledWithExactly(regressionPath);
        expect(mkdir.thirdCall).to.have.been.calledWithExactly(diffPath);
      });
    });

    it('should create the artifacts folders with subfolders', () => {
      const folders = 'foo/bar';
      fileExists.returns(Promise.resolve(false));
      writeImage.returns(Promise.resolve());
      return matchImageOf('id', folders).then(() => {
        expect(mkdir.callCount).to.equal(3);
        expect(mkdir.firstCall).to.have.been.calledWithExactly(baselinePath + folders);
        expect(mkdir.secondCall).to.have.been.calledWithExactly(regressionPath + folders);
        expect(mkdir.thirdCall).to.have.been.calledWithExactly(diffPath + folders);
      });
    });
  });
});
