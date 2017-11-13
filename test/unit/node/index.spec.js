const { Runner } = require('../../../src/node');
const globby = require('globby');
const path = require('path');

describe('NODE command', () => {
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
    const runner = new Runner(argv);
    const req = sandbox.stub(runner, 'importCwd');
    runner.require();
    expect(req).to.have.been.calledWithExactly('foo');
  });

  it('should delete coverage', () => {
    const runner = new Runner({});
    const cov = global.__coverage__ // eslint-disable-line
    runner.deleteCoverage();
    expect(global.__coverage__).to.eql(undefined); // eslint-disable-line
    global.__coverage__ = cov; // eslint-disable-line
  });

});
