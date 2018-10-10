const EventEmitter = require('events');
const globby = require('globby');
const Mocha = require('mocha');
const chokidar = require('chokidar');
const importCwd = require('import-cwd');
const NYC = require('nyc');
const fs = require('fs');
const path = require('path');
const utils = require('@after-work.js/utils');
const { deleteTransform } = require('@after-work.js/transform');
const options = require('./options');

class Runner extends EventEmitter {
  constructor(argv, libs = {
    Mocha,
    NYC,
    importCwd,
    chokidar,
  }) {
    super();
    this.argv = argv;
    this.testFiles = [];
    this.onlyTestFiles = [];
    this.srcFiles = [];
    this.onlySrcFiles = [];
    this.mochaRunner = undefined;
    this.mocha = undefined;
    this.nyc = undefined;
    this.isWrapped = false;
    this.isRunning = false;
    this.libs = libs;
    this.debugging = false;
    this.snapshotStates = new Map();
  }

  logLine(prefix, msg) {
    utils.writeLine(prefix, msg);
  }

  safeDeleteCache(f) {
    utils.safeDeleteCache(f);
    deleteTransform(f);
  }

  setOnlyFilesFromTestFile(testFile) {
    const testName = path.basename(testFile).split('.').shift();
    this.safeDeleteCache(testFile);
    deleteTransform(testFile);
    const mod = utils.safeRequireCache(testFile);
    const found = mod
      .children
      .filter(m => this.srcFiles.indexOf(m.id) !== -1)
      .map(m => m.id);
    const use = utils.matchDependency(found, testName);
    this.onlyTestFiles = [testFile];
    this.onlySrcFiles = [...new Set([...use])];
  }

  setOnlyFilesFromSrcFile(srcFile) {
    const srcName = path.basename(srcFile).split('.').shift();
    const found = this.testFiles.filter((f) => {
      const mod = utils.safeRequireCache(f);
      return mod
        .children
        .filter(m => m.id === srcFile).length !== 0;
    });
    const use = utils.matchDependency(found, srcName);
    this.onlyTestFiles = [...new Set([...use])];
    this.onlySrcFiles = [srcFile];
  }

  findFiles(glob) {
    return globby.sync(glob).map(f => path.resolve(f));
  }

  getFilter() {
    return this.argv.filter.node;
  }

  setTestFiles() {
    this.testFiles = utils.filter(this.getFilter().files, this.findFiles(this.argv.glob));
    if (!this.testFiles.length) {
      console.error('No files found for:', this.argv.glob);
      if (!this.argv.interactive) {
        this.exit(1);
      }
    }
    return this;
  }

  setSrcFiles() {
    this.srcFiles = utils.filter(this.getFilter().files, this.findFiles(this.argv.src));
    return this;
  }

  require() {
    if (!this.argv.coverage) {
      this.register();
    }
    this.argv.require.forEach(m => this.libs.importCwd(m));
    return this;
  }

  deleteCoverage() {
    delete global.__coverage__;
    return this;
  }

  onFinished(failures) {
    this.isRunning = false;
    if (this.argv.watch) {
      return;
    }
    this.exit(failures);
    if (this.argv.exit) {
      process.exit();
    }
  }

  onEnd() {
    if (this.argv.coverage) {
      this.nyc.writeCoverageFile();
      this.nyc.report();
    }
    if (this.argv.watch) {
      this.emit('watchEnd');
    }
  }

  runTests() {
    this.isRunning = true;
    this.mochaRunner = this.mocha.run(failures => this.onFinished(failures));
    this.mochaRunner.once('start', () => utils.clearLine());
    this.mochaRunner.once('end', () => this.onEnd());
  }

  register() {
    if (this.argv.hookRequire) {
      require('@after-work.js/register')(this.argv, this.srcFiles, this.testFiles);
    }
  }

  setup(testFiles, srcFiles) {
    srcFiles.forEach(f => this.safeDeleteCache(f));
    if (this.argv.coverage) {
      this.nyc.reset();
      if (!this.isWrapped) {
        this.nyc.wrap();
        this.isWrapped = true;
        this.register();
      }
    }
    testFiles.forEach((f) => {
      this.safeDeleteCache(f);
      this.mocha.addFile(f);
    });
    if (this.argv.coverage) {
      srcFiles.forEach((f) => {
        if (!this.argv.shouldInstrument(f)) {
          return;
        }
        this.logLine('Loading', f);
        require(f);
      });
    }
    return this;
  }

  setupAndRunTests(testFiles, srcFiles) {
    this.snapshotStates.clear();
    process.removeAllListeners();
    if (this.mochaRunner) {
      this.mochaRunner.removeAllListeners();
    }
    this.mocha = new this.libs.Mocha(this.argv.mocha);
    this.mocha.suite.on('pre-require', (_, file) => {
      this.logLine('Loading', file);
    });
    this.nyc = new this.libs.NYC(this.argv.nyc);
    this.argv.shouldInstrument = f => this.nyc.exclude.shouldInstrument(f);
    try {
      this
        .deleteCoverage()
        .setup(testFiles, srcFiles)
        .runTests();
    } catch (err) {
      this.isRunning = false;
      console.error(err);
      if (this.argv.watch) {
        this.emit('interactive');
        return;
      }
      this.exit(1);
    }
  }

  run() {
    this.setupAndRunTests(this.testFiles, this.srcFiles);
  }

  autoDetectDebug() {
    const exv = process.execArgv.join();
    const debug = exv.includes('inspect') || exv.includes('debug');
    if (debug) {
      this.argv.mocha.enableTimeouts = false;
      this.debugging = true;
    }
    return this;
  }

  exit(code) {
    process.exitCode = code;
  }
}

const configure = (configPath) => {
  if (configPath === null) {
    return {};
  }
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config ${configPath} not found`);
  }
  let config = {};
  const foundConfig = require(configPath);
  if (typeof foundConfig === 'function') {
    config = Object.assign({}, foundConfig());
  } else {
    config = Object.assign({}, foundConfig);
  }
  return config;
};

const node = {
  Runner,
  configure,
  command: ['node', '$0'],
  desc: 'Run tests in node',
  builder(yargs) {
    return yargs
      .options(options)
      .config('config', configure)
      .coerce('babel', utils.coerceBabel);
  },
  handler(argv) {
    const runner = new node.Runner(argv);
    if (argv.presetEnv) {
      require('@after-work.js/preset-plugin')(runner);
    }
    let skipInitialInteractive = false;
    if (argv.watch && !argv.interactive) {
      skipInitialInteractive = true;
      argv.interactive = true;
    }
    if (argv.interactive) {
      require('@after-work.js/interactive-plugin')(runner);
    }
    if (argv.watch) {
      require('@after-work.js/watch-plugin')(runner);
    }
    runner
      .autoDetectDebug()
      .setTestFiles()
      .setSrcFiles()
      .require();
    if (!skipInitialInteractive && argv.interactive) {
      runner.emit('interactive');
      return runner;
    }
    runner.run();
    return runner;
  },
};

module.exports = node;
