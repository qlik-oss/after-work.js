/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0 */
const EventEmitter = require('events');
const readline = require('readline');
const globby = require('globby');
const Mocha = require('mocha');
const chokidar = require('chokidar');
const importCwd = require('import-cwd');
const NYC = require('nyc');
const fs = require('fs');
const path = require('path');
const utils = require('@after-work.js/utils');
const { getTransform, deleteTransform } = require('@after-work.js/transform');
const { SnapshotState, toMatchSnapshot } = require('jest-snapshot');
const options = require('./options');

const getSourceContent = (filename) => {
  const { map } = getTransform(filename) || {};
  if (map) {
    return map.sourcesContent[0];
  }
  return fs.readFileSync(filename, 'utf8');
};

class Runner extends EventEmitter {
  constructor(argv, libs = { Mocha, NYC, importCwd, chokidar }) {
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
    this.all = true;
    this.libs = libs;
    this.debugging = false;
    this.snapshotStates = new Map();
  }

  addToMatchSnapshot() {
    const runner = this;
    const chai = importCwd.silent('chai');
    if (chai) {
      // eslint-disable-next-line prefer-arrow-callback
      chai.Assertion.addMethod('toMatchSnapshot', function chaiToMatchSnapshot() {
        const [filename, lineno] = utils.getCurrentFilenameStackInfo(runner.testFiles);
        const src = getSourceContent(filename);
        const lines = src.split('\n');

        let currentTestName = null;
        for (let i = lineno - 1; i >= 0; i -= 1) {
          const line = lines[i];
          if (line.trimLeft().startsWith('it')) {
            [, currentTestName] = line.match(/it.*\((.*),/);
            break;
          }
        }
        if (currentTestName === null) {
          throw new Error('Can not find current test name');
        }

        let snapshotState = runner.snapshotStates.get(filename);
        if (!snapshotState) {
          const snapshotPath = `${path.join(
            path.join(path.dirname(filename), '__snapshots__'),
            `${path.join(path.basename(filename))}.snap`,
          )}`;
          snapshotState = new SnapshotState(currentTestName, {
            updateSnapshot: runner.argv.updateSnapshot ? 'all' : 'new',
            snapshotPath,
          });
          runner.snapshotStates.set(filename, snapshotState);
        }
        const matcher = toMatchSnapshot.bind({
          snapshotState,
          currentTestName,
        });
        const result = matcher(this._obj);
        snapshotState.save();
        this.assert(
          result.pass,
          result.message,
          result.message,
          result.expected,
          result.actual,
        );
      });
    }
    return this;
  }

  log(mode, testFiles, srcFiles) {
    if (this.debugging) {
      return this;
    }
    console.log(mode);
    console.log('  test');
    testFiles.forEach((f) => {
      console.log(`    \u001b[90m${f}\u001b[0m`);
    });
    console.log('  src');
    srcFiles.forEach((f) => {
      console.log(`    \u001b[90m${f}\u001b[0m`);
    });
    console.log('\nSave\u001b[90m a test file or source file to run only affected tests\u001b[0m');
    console.log('\u001b[90mPress\u001b[0m a \u001b[90mto run all tests\u001b[0m');
    return this;
  }

  logLine(msg) {
    if (this.argv.outputReporterOnly) {
      return;
    }
    utils.writeLine(msg);
  }

  logClearLine() {
    if (this.argv.outputReporterOnly) {
      return;
    }
    utils.clearLine();
  }

  safeDeleteCache(f) {
    utils.safeDeleteCache(f);
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

  setTestFiles() {
    this.testFiles = globby.sync(this.argv.glob).map(f => path.resolve(f));
    if (!this.testFiles.length) {
      console.log('No files found for:', this.argv.glob);
      this.exit(1);
    }
    return this;
  }

  setSrcFiles() {
    this.srcFiles = globby.sync(this.argv.src).map(f => path.resolve(f));
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
    this.emit('onFinished', failures);
    process.on('exit', () => {
      this.exit(failures);
    });
    if (this.argv.exit) {
      this.exit();
    }
  }

  onEnd() {
    if (this.argv.coverage) {
      this.nyc.writeCoverageFile();
      this.nyc.report();
    }
    if (this.argv.watch) {
      const mode = this.all ? 'All' : 'Only';
      const testFiles = this.all ? [`${this.argv.glob}`] : this.onlyTestFiles;
      const srcFiles = this.all ? [`${this.argv.src}`] : this.onlySrcFiles;
      this.log(mode, testFiles, srcFiles);
    }
  }

  runTests() {
    this.isRunning = true;
    this.mochaRunner = this.mocha.run(failures => this.onFinished(failures));
    this.mochaRunner.once('start', () => this.logClearLine());
    this.mochaRunner.once('end', () => this.onEnd());
  }

  setupKeyPress() {
    if (!this.argv.watch) {
      return this;
    }
    if (typeof process.stdin.setRawMode !== 'function') {
      return this;
    }
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');
    process.stdin.on('keypress', (str) => {
      if (str === '\u0003') {
        this.emit('forceExit');
        process.exit(0);
      }
      if (this.isRunning) {
        return;
      }
      switch (str) {
        case 'a':
          this.all = true;
          this.setupAndRunTests(this.testFiles, this.srcFiles);
          break;
        default: break;
      }
    });
    return this;
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
        if (!this.nyc.exclude.shouldInstrument(f)) {
          return;
        }
        this.logLine(`Loading ${f}`);
        require(`${f}`);
      });
    }
    return this;
  }

  setupAndRunTests(testFiles, srcFiles) {
    process.removeAllListeners();
    if (this.mochaRunner) {
      this.mochaRunner.removeAllListeners();
    }
    this.mocha = new this.libs.Mocha(this.argv.mocha);
    this.mocha.suite.on('pre-require', (_, file) => {
      this.logLine(`Loading ${file}`);
    });
    this.nyc = new this.libs.NYC(this.argv.nyc);
    this.argv.instrument = {
      testExclude: this.nyc.exclude,
    };
    try {
      this
        .deleteCoverage()
        .setup(testFiles, srcFiles)
        .runTests();
    } catch (err) {
      this.isRunning = false;
      console.log(err);
      if (this.argv.watch) {
        return;
      }
      this.exit(1);
    }
  }

  onWatchAdd(f) {
    const base = path.basename(f);
    const parts = base.split('.');
    if (parts.length > 1) {
      this.testFiles.push(f);
    } else {
      this.srcFiles.push(f);
    }
  }

  onWatchUnlink(f) {
    const tIx = this.testFiles.indexOf(f);
    const sIx = this.srcFiles.indexOf(f);
    if (tIx !== -1) {
      this.testFiles.splice(tIx, 1);
    }
    if (sIx !== -1) {
      this.srcFiles.splice(sIx, 1);
    }
    this.safeDeleteCache(f);
    deleteTransform(f);
  }

  onWatch(f) {
    if (this.isRunning) {
      return;
    }
    const isTestFile = this.testFiles.indexOf(f) !== -1;
    const isSrcFile = this.srcFiles.indexOf(f) !== -1;
    this.all = false;
    if (isTestFile) {
      this.setOnlyFilesFromTestFile(f);
    } else if (isSrcFile) {
      this.setOnlyFilesFromSrcFile(f);
    } else {
      this.onlySrcFiles = this.srcFiles;
      this.onlyTestFiles = this.testFiles;
    }
    this.setupAndRunTests(this.onlyTestFiles, this.onlySrcFiles);
  }

  run() {
    this.setupAndRunTests(this.testFiles, this.srcFiles);
    if (this.argv.watch) {
      this.libs.chokidar.watch(this.argv.watchGlob, { ignoreInitial: true })
        .on('change', f => this.onWatch(path.resolve(f)))
        .on('add', f => this.onWatchAdd(path.resolve(f)))
        .on('unlink', f => this.onWatchUnlink(path.resolve(f)));
    }
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
    process.exit(code);
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
      .coerce('nyc', (opt) => {
        if (opt.babel) {
          opt.sourceMap = false;
          opt.instrumenter = './lib/instrumenters/noop';
        }
        return opt;
      });
  },
  handler(argv) {
    if (argv.presetEnv) {
      require(argv.presetEnv);
    }
    const runner = new node.Runner(argv);
    runner
      .addToMatchSnapshot()
      .autoDetectDebug()
      .setupKeyPress()
      .setTestFiles()
      .setSrcFiles()
      .require()
      .run();
    return runner;
  },
};

module.exports = node;
