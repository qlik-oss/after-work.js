const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const utils = require('../../../../src//plugins/reporter/utils');

describe('Reporter Utils', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getRepoInfo', () => {
    const repoInfo = {
      name: 'repo name',
      version: 'x.y.z',
      description: 'Descriptive text',
    };

    beforeEach(() => {
      sandbox.stub(path, 'resolve').returns('./package.json');
      sandbox.stub(fs, 'readFileSync').returns(JSON.stringify(repoInfo));
    });

    it('should return a correct object', () => {
      expect(utils.getRepoInfo()).to.deep.equal({ name: 'repo name', version: 'x.y.z', description: 'Descriptive text' });
    });
  });

  describe('cleanCode', () => {
    let str;
    let cleaned;

    it('should clean the first function called', () => {
      str = 'function(){{}';
      cleaned = '{}';
      expect(utils.cleanCode(str)).to.equal(cleaned);
    });

    it('should clean leading spaces', () => {
      str = '    |    |';
      cleaned = '|    |';
      expect(utils.cleanCode(str)).to.equal(cleaned);
    });
  });

  describe('errorJSON', () => {
    const err = {
      name: 'AssertionError',
      message: 'No baseline found! New baseline generated at ...',
      showDiff: false,
      actual: {},
      expected: {
        baseline: 'baseline/variant.png',
        diff: 'diff/variant.png',
        regression: 'regression/variant.png',
      },
      stack: 'AssertionError: No baseline found! New baseline generated at ...)',
    };

    it('should clean the error', () => {
      expect(utils.errorJSON(err)).to.deep.equal(err);
    });
  });

  describe('cleanTest', () => {
    const test = {
      title: 'should something',
      fullTitle() { return 'Component: variant should match baseline'; },
      fn: {
        toString() {},
      },
      body: 'function () {return expect(browser.takeImageOf(settings)).to.eventually.matchImageOf(fixture);',
      async: 1,
      sync: false,
      timedOut: false,
      pending: false,
      type: 'test',
      file: 'F:\\git\\after-workJS\\components.spec.js',
      parent: '#<Suite>',
      ctx: '#<Context>',
      duration: 572,
      state: 'passed',
      speed: 'slow',
    };

    const result = {
      title: 'should something',
      fullTitle: 'Component: variant should match baseline',
      state: 'passed',
      passed: true,
      failed: false,
      pending: false,
      code: '<span class="hljs-keyword">return</span> expect(browser.takeImageOf(settings)).to.eventually.matchImageOf(fixture);',
      timedOut: false,
      duration: 572,
      file: 'F:\\git\\after-workJS\\components.spec.js',
      screenshot: '',
      err: {},
      consoleEntries: [],
    };

    beforeEach(() => {
      sandbox.stub(test.fn, 'toString').returns('function () {return expect(browser.takeImageOf(settings)).to.eventually.matchImageOf(fixture);');
    });

    it('should clean the error', () => {
      expect(utils.cleanTest(test)).to.deep.equal(result);
    });
  });

  describe('safeFileName', () => {
    const title = 'internet explorer';
    const cleaned = 'internet_explorer';

    it('should return a safe filename', () => {
      expect(utils.safeFileName(title)).to.equal(cleaned);
    });
  });

  describe('screenshotName', () => {
    const title = 'Component: variant should match baseline';
    const browserName = 'chrome';
    const startTime = '1970-12-24_08-00-00';
    const result = 'component__variant_should_match_baseline-chrome-1970-12-24_08-00-00.png';

    beforeEach(() => {
      sandbox.stub(utils, 'safeFileName').returns('component__variant_should_match_baseline');
    });

    it('should return a safe screenshotname', () => {
      expect(utils.screenshotName(title, browserName, startTime)).to.equal(result);
    });
  });

  describe('saveScreenshot', () => {
    const title = 'SomeTitle';
    let writeFileSync;

    beforeEach(() => {
      global.browser = {
        artifactsPath: 'foo',
        takeScreenshot() {},
        reporterInfo: {
          browserName: 'browser',
          startTime: '2015-10-15_08-00-00',
        },
      };
      sandbox.stub(utils, 'screenshotName');
      sandbox.stub(path, 'resolve').returns('./foo/bar.png');
      sandbox.stub(mkdirp, 'sync');
      sandbox.stub(global.browser, 'takeScreenshot').returns(Promise.resolve('base64'));
      writeFileSync = sandbox.stub(fs, 'writeFileSync');
    });

    afterEach(() => {
      delete global.browser;
    });

    it('should save screenshot to disk', () => utils.saveScreenshot(global.browser, title).then(() => {
      expect(writeFileSync).to.have.been.calledWithExactly('./foo/bar.png', 'base64', { encoding: 'base64' });
    }));
  });
});
