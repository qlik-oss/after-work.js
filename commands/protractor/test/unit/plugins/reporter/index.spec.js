const fs = require('fs');
const mocha = require('mocha');
const mkdirp = require('mkdirp');
const uiReport = require('../../../../src/plugins/reporter');
const utils = require('../../../../src/plugins/reporter/utils');

describe('Reporter index', () => {
  let sandbox;
  let browser;
  const Capabilities = new Map();
  Capabilities.set('browserName', 'chrome');
  Capabilities.set('version', '62.0.3202.75');
  Capabilities.set('platform', 'Linux');

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(fs, 'writeFile');
    sandbox.stub(mocha.reporters, 'XUnit');
    sandbox.stub(mkdirp, 'sync');
    sandbox.stub(utils, 'getRepoInfo').returns({
      name: 'name',
      description: 'description',
      version: 'x.y.z',
    });
    browser = {
      getCapabilities: sandbox.stub().returns(Promise.resolve(Capabilities)),
      artifactsPath: 'artifactsPath',
      reporterInfo: 'reporterInfo',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('UI reporter', () => {
    let runner;
    let options;

    beforeEach(() => {
      runner = {
        on: sandbox.stub(),
        once: sandbox.stub(),
      };
      options = {
        reporterPlugin: {
          teardown: sandbox.stub().returns(Promise.resolve(true)),
          getBrowser: sandbox.stub().returns(browser),
        },
        reporterOptions: {
          xunit: true,
        },
      };
      sandbox.stub(utils, 'saveScreenshot').returns(Promise.resolve());
    });

    it('should call pass correctly', () => {
      const test = {
        fullTitle: sandbox.stub().returns('Title'),
        duration: sandbox.stub().returns('Duration'),
        slow: () => {},
      };
      const log = sandbox.stub(console, 'log');
      // runner.on.withArgs( "pass" ).callsArgOnWith( 1, {}, test );
      runner.on.withArgs('pass').callsArgWith(1, test);
      uiReport.call(uiReport, runner, options);
      expect(runner.on).to.be.calledWith('pass', sinon.match.func);
      expect(console.log).to.be.calledWith(sinon.match(' √ PASSED:')); // eslint-disable-line no-console
      log.restore();
    });

    it('should call pending correctly', () => {
      const test = null;

      runner.on.withArgs('pending').callsArgWith(1, test);
      uiReport.call(uiReport, runner, options);
      expect(runner.on).to.be.calledWith('pending', sinon.match.func);
    });

    it('should call fail correctly', () => {
      const test = {
        fullTitle: sandbox.stub().returns('Title'),
        duration: sandbox.stub().returns('Duration'),
        file: sandbox.stub(),
      };
      const err = {
        message: sandbox.stub().returns('err.message'),
      };

      const log = sandbox.stub(console, 'log');
      runner.on.withArgs('fail').callsArgWith(1, test, err);
      uiReport.call(uiReport, runner, options);
      expect(runner.on).to.be.calledWith('fail', sinon.match.func);
      expect(console.log).to.be.calledWith(sinon.match(' X FAILED:')); // eslint-disable-line no-console
      log.restore();
    });

    it('should call end correctly', () => {
      const log = sandbox.stub(console, 'log');
      runner.once.withArgs('end').callsArgOn(1, runner);
      uiReport.call(uiReport, runner, options);
      expect(runner.once).to.be.calledWith('end', sinon.match.func);
      expect(console.log).to.be.calledWith(sinon.match(' Σ SUMMARY:')); // eslint-disable-line no-console
      log.restore();
    });
  });
});
