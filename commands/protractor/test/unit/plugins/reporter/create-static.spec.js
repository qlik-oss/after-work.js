const fs = require('fs');
const report = require('../../../../src/plugins/reporter/create-static');

describe('Reporter create-static', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('generate', () => {
    let writeFileSync;
    const durationMS = 999;
    const durationS = 1001;
    const durationM = 60001;
    const durationH = 3600001;

    beforeEach(() => {
      writeFileSync = sandbox.stub(fs, 'writeFileSync');
      sandbox.stub(fs, 'readFileSync');
    });

    it('should be possible to generate a report', () => {
      sandbox.stub(JSON, 'parse').returns({
        tests: [
          {
            title: 'title',
            fullTitle: 'fulTitle',
            state: 'failed',
            passed: false,
            failed: true,
            pending: false,
            code: '<span class="hljs-keyword">return</span> expect(browser.takeImageOf(settings)).to.eventually.matchImageOf(fixture);',
            timedOut: false,
            duration: durationMS,
            file: 'F:\\git\\repo\\test\\component\\components.spec.js',
            screenshot: 'screenshots/title.png',
            err: {
              message: 'Error message',
              showDiff: false,
              actual: {},
              expected: {
                baseline: 'baseline/title.png',
                diff: 'diff/title.png',
                regression: 'regression/title.png',
              },
              stack: 'AssertionError: ...',
            },
          },
        ],
        stats: {
          suites: 1,
          tests: 1,
          passes: 0,
          pending: 0,
          failures: 1,
          start: '2015-12-08T08:20:36.329Z',
          end: '2015-12-08T08:20:38.669Z',
          duration: durationMS,
          browserName: 'chrome',
          browserVersion: '47.0.2526.73',
          platform: 'XP',
          name: 'repo name',
          description: 'short description',
          version: 'x.y.z',
        },
      });

      return report.generate('jsonFileName').then(() => {
        expect(writeFileSync).to.not.throw();
      });
    });

    it('should format the duration correctly (ms)', () => {
      sandbox.stub(JSON, 'parse').returns({
        tests: [
          {
            duration: durationMS,
          },
        ],
        stats: {
          duration: durationMS,
        },
      });

      return report.generate('jsonFileName').then(() => {
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<i class="sensei-stopwatch"></i>999 ms</li>'));
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<span>999 ms</span>'));
      });
    });

    it('should format the duration correctly (s)', () => {
      sandbox.stub(JSON, 'parse').returns({
        tests: [
          {
            duration: durationS,
          },
        ],
        stats: {
          duration: durationS,
        },
      });

      return report.generate('jsonFileName').then(() => {
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<i class="sensei-stopwatch"></i>1.1 s</li>'));
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<span>1.1 s</span>'));
      });
    });

    it('should format the duration correctly (m)', () => {
      sandbox.stub(JSON, 'parse').returns({
        tests: [
          {
            duration: durationM,
          },
        ],
        stats: {
          duration: durationM,
        },
      });

      return report.generate('jsonFileName').then(() => {
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<i class="sensei-stopwatch"></i>1:00 m</li>'));
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<span>1:00.1 m</span>'));
      });
    });

    it('should format the duration correctly (h)', () => {
      sandbox.stub(JSON, 'parse').returns({
        tests: [
          {
            duration: durationH,
          },
        ],
        stats: {
          duration: durationH,
        },
      });

      return report.generate('jsonFileName').then(() => {
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<i class="sensei-stopwatch"></i>1:00 h</li>'));
        expect(writeFileSync).to.be.calledWith(sinon.match.string, sinon.match('<span>1:00:00.1 h</span>'));
      });
    });
  });
});
