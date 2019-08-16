const fs = require('fs');
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

  describe('removeFile', () => {
    it('should resolve if the file could be removed', () => {
      sandbox.stub(fs, 'unlink').callsArgWith(1, false);
      return expect(
        utils.removeFile('foo'),
      ).to.eventually.be.fulfilled.and.be.an('undefined');
    });

    it("should reject if the file couldn't be removed", () => {
      sandbox.stub(fs, 'unlink').callsArgWith(1, 'error');
      return expect(utils.removeFile('foo')).to.eventually.be.rejectedWith(
        'error',
      );
    });
  });

  describe('removeFiles', () => {
    it('should resolve if files were removed', () => {
      sandbox.stub(utils, 'removeFile').returns(Promise.resolve());
      return expect(
        utils.removeFiles('foo', 'bar', 'baz'),
      ).to.eventually.be.fulfilled.and.be.an('array');
    });

    it('should reject if not all files were removed', () => {
      const error = new Error('error');
      sandbox.stub(utils, 'removeFile').returns(Promise.reject(error));
      return expect(
        utils.removeFiles('foo', 'bar', 'baz'),
      ).to.eventually.be.rejectedWith(error);
    });
  });

  describe('getBoundingClientRect', () => {
    let querySelector;
    let getBoundingClientRect;
    const Element = function Element() {};

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
        left: 10,
        top: 20,
        width: 30,
        height: 40,
      };
      const cbRect = {
        left: 10,
        top: 20,
        width: 30,
        height: 40,
        ratio: 2,
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
        executeAsyncScript: sandbox.stub().returns(
          Promise.resolve({
            left: 200,
            top: 100,
            width: 200,
            height: 100,
          }),
        ),
        takeScreenshot: sandbox.stub().returns(Promise.resolve('foo')),
        getCapabilities: sandbox.stub().returns(Promise.resolve(Capabilities)),
        getProcessedConfig: sandbox.stub().returns(Promise.resolve({})),
        reporterInfo: {
          artifactsPath: '',
        },
      };
      crop = sandbox.stub();
      sandbox.stub(jimp, 'read').returns(Promise.resolve({ crop }));
    });

    it('should resolve if it was possible to take an image with selector', () => utils.takeImageOf(browser, { selector: 'my-selector' }).then(result => {
      expect(crop).to.have.been.calledWith(200, 100, 200, 100);
      expect(result.rect).to.deep.equal({
        top: 100,
        left: 200,
        width: 200,
        height: 100,
      });
      expect(result.browserName).to.equal('chrome');
    }));

    it('should resolve if it was possible to take an image with default selector', () => utils.takeImageOf(browser, {}).then(result => {
      expect(result.rect).to.deep.equal({
        top: 100,
        left: 200,
        width: 200,
        height: 100,
      });
      expect(result.browserName).to.equal('chrome');
      expect(result.platform).to.equal('windows-nt');
    }));

    it('should add offset to the rect used for cropping', () => utils
      .takeImageOf(browser, {
        selector: 'my-selector',
        offsetX: -5,
        offsetY: -5,
        offsetWidth: 5,
        offsetHeight: 5,
      })
      .then(result => {
        expect(crop).to.have.been.calledWith(195, 95, 205, 105);
        expect(result.rect).to.deep.equal({
          top: 95,
          left: 195,
          width: 205,
          height: 105,
        });
        expect(result.browserName).to.equal('chrome');
      }));

    it('should work with IE11 capabilities', async () => {
      Capabilities.delete('platform');
      Capabilities.set('platform', 'windows');
      Capabilities.set('browserName', 'internet explorer');
      const result = await utils.takeImageOf(browser, {});

      expect(result.rect).to.deep.equal({
        top: 100,
        left: 200,
        width: 200,
        height: 100,
      });
      expect(result.browserName).to.equal('internet-explorer');
      expect(result.platform).to.equal('windows');
    });
  });
});
