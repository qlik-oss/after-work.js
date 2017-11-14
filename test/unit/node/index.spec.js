/* eslint object-curly-newline: 0 */
const cmd = require('../../../src/node');
const cmdOpts = require('../../../src/node/options');
const globby = require('globby');
const path = require('path');

const { Runner, configure, coerceNyc, builder, handler } = cmd;

describe('Node command', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should export Runner', () => {
    expect(Runner).to.be.a('function');
    expect(Runner).to.throw();
  });

  it('should set members', () => {
    const argv = {};
    const runner = new Runner(argv);
    expect(runner.argv).to.equal(argv);
    expect(runner.files).to.eql([]);
    expect(runner.srcFiles).to.eql([]);
    expect(runner.mochaRunner).to.equal(undefined);
    expect(runner.mocha).to.equal(undefined);
    expect(runner.nyc).to.equal(undefined);
    expect(runner.isFirstRun).to.equal(true);
  });

  it('should set files', () => {
    const argv = {};
    const runner = new Runner(argv);
    sandbox.stub(globby, 'sync').returns(['foo.js']);
    runner.setFiles();
    expect(runner.files).to.eql([path.resolve('foo.js')]);
  });

  it('should exit if no files found', () => {
    const exit = sandbox.stub(process, 'exit');
    const argv = {};
    const runner = new Runner(argv);
    sandbox.stub(globby, 'sync').returns([]);
    sandbox.stub(console, 'log');
    runner.setFiles();
    expect(exit).to.have.been.calledWithExactly(1);
  });

  it('should set srcFiles', () => {
    const argv = {};
    const runner = new Runner(argv);
    sandbox.stub(globby, 'sync').returns(['foo.js']);
    runner.setSrcFiles();
    expect(runner.srcFiles).to.eql([path.resolve('foo.js')]);
  });

  it('should ensureBabelRequire', () => {
    const argv = { require: ['babel-register'], coverage: true, nyc: { babel: true } };
    const runner = new Runner(argv);
    runner.ensureBabelRequire();
    expect(runner.argv.require).to.eql([]);
  });

  it('should require', () => {
    const argv = { require: ['foo'] };
    const importCwd = sandbox.stub();
    const runner = new Runner(argv, { importCwd });
    runner.require();
    expect(importCwd).to.have.been.calledWithExactly('foo');
  });

  it('should delete coverage', () => {
    const runner = new Runner({});
    const cov = global.__coverage__ // eslint-disable-line
    runner.deleteCoverage();
    expect(global.__coverage__).to.eql(undefined); // eslint-disable-line
    global.__coverage__ = cov; // eslint-disable-line
  });

  describe('Run tests', () => {
    it('should exit with correct exit code', () => {
      const exit = sandbox.stub(process, 'exit');
      const on = sandbox.stub(process, 'on');
      const runner = new Runner({});
      const run = sandbox.stub().returns({ on: sandbox.stub() });
      runner.mocha = { run };
      runner.runTests();
      run.callArgWith(0, 9);
      on.callArg(1);
      expect(exit).to.have.been.calledWithExactly(9);
    });

    it('should write coverage file', () => {
      const writeCoverageFile = sandbox.stub();
      const report = sandbox.stub();
      const runner = new Runner({ coverage: true });
      runner.nyc = { writeCoverageFile, report };
      const on = sandbox.stub();
      const run = sandbox.stub().returns({ on });
      runner.mocha = { run };
      runner.runTests();
      on.callArgWith(1);
      expect(runner.nyc.writeCoverageFile).to.have.been.calledWithExactly();
      expect(runner.nyc.report).to.have.been.calledWithExactly();
    });

    describe('setup', () => {
      it('should reset and wrap nyc', () => {
        const reset = sandbox.stub();
        const wrap = sandbox.stub();
        const runner = new Runner({ coverage: true });
        runner.nyc = { reset, wrap };
        runner.setup();
        expect(reset).to.have.been.calledWithExactly();
        expect(wrap).to.have.been.calledWithExactly();
      });

      it('should reset and not wrap nyc on consecutive run', () => {
        const reset = sandbox.stub();
        const wrap = sandbox.stub();
        const runner = new Runner({ coverage: true });
        runner.nyc = { reset, wrap };
        runner.isFirstRun = false;
        runner.setup();
        expect(reset).to.have.been.calledWithExactly();
        expect(wrap.callCount).to.equal(0);
      });

      it('should add file to mocha', () => {
        const reset = sandbox.stub();
        const wrap = sandbox.stub();
        const addFile = sandbox.stub();
        const runner = new Runner({ coverage: true });
        runner.nyc = { reset, wrap };
        runner.mocha = { addFile };
        const file = path.resolve('test/unit/node/index.spec.js');
        const files = [file];
        const srcFiles = [path.resolve('src/node/index.js')];
        runner.files = files;
        runner.srcFiles = srcFiles;
        runner.setup();
        expect(addFile).to.have.been.calledWithExactly(file);
      });
    });

    it('should remove all listeners', () => {
      const procRemoveAllListeners = sandbox.stub(process, 'removeAllListeners');
      const removeAllListeners = sandbox.stub();
      const mochaRunner = { removeAllListeners };
      class Dummy { }
      const runner = new Runner({}, { Mocha: Dummy, NYC: Dummy });
      sandbox.stub(runner, 'deleteCoverage').returnsThis();
      sandbox.stub(runner, 'setup').returnsThis();
      sandbox.stub(runner, 'runTests').returnsThis();
      runner.mochaRunner = mochaRunner;
      runner.setupAndRunTests();
      expect(procRemoveAllListeners).to.have.been.calledWithExactly();
      expect(removeAllListeners).to.have.been.calledWithExactly();
    });

    it('should setupAndRunTests', () => {
      sandbox.stub(process, 'removeAllListeners');
      const mochaRunner = { removeAllListeners: sandbox.stub() };
      class Dummy { }
      const runner = new Runner({}, { Mocha: Dummy, NYC: Dummy });
      const del = sandbox.stub(runner, 'deleteCoverage').returnsThis();
      const set = sandbox.stub(runner, 'setup').returnsThis();
      const run = sandbox.stub(runner, 'runTests').returnsThis();
      runner.mochaRunner = mochaRunner;
      runner.setupAndRunTests();
      expect(del).to.have.been.calledImmediatelyBefore(set);
      expect(run).to.have.been.calledImmediatelyAfter(set);
    });

    it('should run without watching', () => {
      const runner = new Runner({ watch: false });
      runner.setupAndRunTests = sandbox.stub();
      runner.run();
      expect(runner.setupAndRunTests).to.have.been.calledWithExactly();
    });

    it('should run with watching', () => {
      const watchGlob = ['foo.js'];
      const on = sandbox.stub();
      const watch = sandbox.stub().returns({ on });
      const chokidar = { watch };
      const runner = new Runner({ watch: true, watchGlob }, { chokidar });
      runner.setupAndRunTests = sandbox.stub();
      runner.run();
      on.callArg(1);
      expect(runner.isFirstRun).to.equal(false);
      expect(runner.setupAndRunTests.callCount).to.equal(2);
    });

    describe('configure', () => {
      it('should return empty object when no config option is passed', () => {
        expect(configure(null)).to.eql({});
      });

      it('should throw error if config not found', () => {
        expect(configure.bind(null, 'foo.js')).to.throw();
      });

      it('should call function for passed config file', () => {
        const configPath = path.resolve('test/unit/node/config-function.js');
        expect(configure(configPath).glob).to.eql(['foo.js']);
      });

      it('should apply passed config file', () => {
        const configPath = path.resolve('aw.config.js');
        expect(configure(configPath).src).to.eql(['src/**/!(browser-shim|cli|env)*.js']);
      });
    });

    describe('coerceNyc', () => {
      it('should set options when babel is truthy', () => {
        const opt = { babel: true, require: [], sourceMap: true, instrumenter: '' };
        expect(coerceNyc(opt)).to.eql({ babel: true, require: ['babel-register'], sourceMap: false, instrumenter: './lib/instrumenters/noop' });
      });
    });

    it('should build', () => {
      const options = sandbox.stub().returnsThis();
      const config = sandbox.stub().returnsThis();
      const coerce = sandbox.stub().returnsThis();
      const yargs = { options, config, coerce };
      builder(yargs);
      expect(options).to.have.been.calledWithExactly(cmdOpts);
      expect(config).to.have.been.calledWithExactly('config', configure);
      expect(coerce).to.have.been.calledWithExactly('nyc', coerceNyc);
    });

    it('should call the runner functions', () => {
      const origRunner = cmd.Runner;
      const setFiles = sandbox.stub().returnsThis();
      const setSrcFiles = sandbox.stub().returnsThis();
      const ensureBabelRequire = sandbox.stub().returnsThis();
      const req = sandbox.stub().returnsThis();
      const run = sandbox.stub().returnsThis();
      class Dummy { }
      Dummy.prototype.setFiles = setFiles;
      Dummy.prototype.setSrcFiles = setSrcFiles;
      Dummy.prototype.ensureBabelRequire = ensureBabelRequire;
      Dummy.prototype.require = req;
      Dummy.prototype.run = run;
      cmd.Runner = Dummy;
      handler({});
      expect(setFiles).to.have.been.calledImmediatelyBefore(setSrcFiles);
      expect(setSrcFiles).to.have.been.calledImmediatelyBefore(ensureBabelRequire);
      expect(ensureBabelRequire).to.have.been.calledImmediatelyBefore(req);
      expect(req).to.have.been.calledImmediatelyBefore(run);
      cmd.Runner = origRunner;
    });
  });
});
