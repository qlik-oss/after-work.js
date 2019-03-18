const EventEmitter = require('events');
const globby = require('globby');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const NYC = require('nyc');
const utils = require('@after-work.js/utils');
const { deleteTransform } = require('@after-work.js/transform');
const options = require('./options');

class Runner extends EventEmitter {
  constructor(argv) {
    super();
    this.argv = argv;
    this.testFiles = [];
    this.srcFiles = [];
    this.mochaRunner = undefined;
    this.mocha = undefined;
    this.nyc = undefined;
    this.isWrapped = false;
    this.isRunning = false;
    this.debugging = false;
    this.snapshotContexts = new Map();
    this.warnings = [];
    this.startCallbacks = [];
    this.finishedCallbacks = [];
  }

  logLine(prefix, msg) {
    utils.writeLine(prefix, msg);
  }

  safeDeleteCache(f) {
    utils.safeDeleteCache(f);
    deleteTransform(f);
  }

  getMatchedSrcDependency(testFile) {
    const testName = path
      .basename(testFile)
      .split('.')
      .shift();
    this.safeDeleteCache(testFile);
    deleteTransform(testFile);
    const mod = utils.safeRequireCache(testFile);
    const found = mod.children
      .filter(m => this.srcFiles.indexOf(m.id) !== -1)
      .map(m => m.id);
    const use = utils.matchDependency(found, testName);
    return use;
  }

  getMatchedTestDependency(srcFile) {
    const srcName = path
      .basename(srcFile)
      .split('.')
      .shift();
    const found = this.testFiles.filter((f) => {
      const mod = utils.safeRequireCache(f);
      return mod.children.filter(m => m.id === srcFile).length !== 0;
    });
    const use = utils.matchDependency(found, srcName);
    return use;
  }

  getSrcFilesFromTestFiles(testFiles) {
    return testFiles.reduce(
      (acc, curr) => [...acc, ...this.getMatchedSrcDependency(curr)],
      [],
    );
  }

  getTestFilesFromSrcFiles(srcFiles) {
    return srcFiles.reduce(
      (acc, curr) => [...acc, ...this.getMatchedTestDependency(curr)],
      [],
    );
  }

  findFiles(glob) {
    return utils.filter(
      this.getFilter().files,
      globby.sync(glob).map(f => path.resolve(f)),
    );
  }

  getFilter() {
    return this.argv.filter.node;
  }

  setTestFiles() {
    this.testFiles = this.findFiles(this.argv.glob).filter(f => utils.isTestFile(f, this.argv));
    if (!this.testFiles.length) {
      console.error('No files found for:', this.argv.glob);
      if (!this.argv.interactive) {
        this.exit(1);
      }
    }
    return this;
  }

  setSrcFiles() {
    this.srcFiles = this.findFiles(this.argv.src).filter(f => utils.isSrcFile(f, this.argv));
    return this;
  }

  require() {
    if (!this.argv.coverage) {
      this.register();
    }
    const importCwd = require('import-cwd');
    this.argv.require.forEach(m => importCwd(m));
    return this;
  }

  deleteCoverage() {
    delete global.__coverage__;
    return this;
  }

  onFinished(failures) {
    if (!this.isRunning) {
      return;
    }
    this.finishedCallbacks.forEach(fn => fn());
    this.isRunning = false;
    if (failures === 0 && this.argv.coverage) {
      this.nyc.writeCoverageFile();
      this.nyc.report();
    }

    if (this.argv.warnings && this.warnings.length) {
      console.error('\u001b[33mwarnings:\u001b[0m');
      this.warnings.forEach((w) => {
        console.error('');
        w();
      });
      console.error('');
    }
    this.snapshotContexts.forEach(({ currentTestName, snapshotState }) => {
      const uncheckedCount = snapshotState.getUncheckedCount();
      if (uncheckedCount) {
        snapshotState.removeUncheckedKeys();
      }
      snapshotState.save();
      if (uncheckedCount && !this.argv.updateSnapshot) {
        console.error(
          `\u001b[33mObsolete snapshot:\u001b[0m \u001b[31m${currentTestName}\u001b[0m \u001b[33m\n\u001b[90mat (${
            snapshotState._snapshotPath
          })\u001b[0m`,
        );
      }
    });
    if (this.argv.watch) {
      this.emit('watchEnd');
      return;
    }
    this.exit(failures);
    if (this.argv.exit) {
      process.exit();
    }
  }

  runTests() {
    this.isRunning = true;
    this.warnings = [];
    this.mochaRunner = this.mocha.run(failures => this.onFinished(failures));
    this.mochaRunner.once('start', () => utils.clearLine());
  }

  register() {
    if (this.argv.hookRequire) {
      require('@after-work.js/register')(
        this.argv,
        this.srcFiles,
        this.testFiles,
        fn => this.warnings.push(fn),
        fn => this.startCallbacks.push(fn),
        fn => this.finishedCallbacks.push(fn),
      );
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
    this.snapshotContexts.clear();
    process.removeAllListeners();
    if (this.mochaRunner) {
      this.mochaRunner.removeAllListeners();
    }
    this.mocha = new Mocha(this.argv.mocha);
    this.mocha.suite.on('pre-require', (_, file) => {
      this.logLine('Loading', file);
    });
    this.nyc = new NYC(this.argv.nyc);
    this.argv.shouldInstrument = f => !utils.isTestFile(f, this.argv) && this.nyc.exclude.shouldInstrument(f);
    try {
      this.deleteCoverage()
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
    this.startCallbacks.forEach(fn => fn());
    this.setupAndRunTests(this.testFiles, this.srcFiles);
  }

  autoDetectDebug() {
    const exv = process.execArgv.join();
    const debug = exv.includes('inspect') || exv.includes('debug');
    if (debug) {
      this.argv.mocha.timeout = false;
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
      .coerce('babel', utils.coerceBabel)
      .middleware((mwargv) => {
        if (!mwargv.babel.enable && mwargv.coverage) {
          mwargv.nyc.hookRequire = true; // Enable nyc instrumenting on the fly
        }
      });
  },
  handler(argv) {
    const runner = new node.Runner(argv);
    argv.__isNodeRunner = true;
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
