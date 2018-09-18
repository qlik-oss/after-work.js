/* eslint no-console: 0, class-methods-use-this: 0, no-restricted-syntax: 0 */
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const chromeLauncher = require('chrome-launcher');
const unmirror = require('chrome-unmirror');
const chokidar = require('chokidar');
const globby = require('globby');
const precinct = require('precinct');
const createServer = require('@after-work.js/server');
const NYC = require('nyc');
const utils = require('@after-work.js/utils');
const { deleteTransform } = require('@after-work.js/transform');
const Mediator = require('./mediator');
const connect = require('./connect');


class Runner extends EventEmitter {
  constructor(argv) {
    super();
    this.argv = argv;
    this.nyc = new NYC(argv.nyc);
    this.mediator = new Mediator();
    this.chromeLauncher = chromeLauncher;
    this.ended = false;
    this.loadError = false;
    this.requests = new Map();
    this.started = false;
    this.isRunning = false;
    this.depMap = new Map();
    this.srcTestMap = new Map();
    this.onlyTestFiles = [];
    this.all = true;
    this.bind();
    this.bindWatch();
    this.debugging = false;
    this.snapshotStates = new Map();
    this.server = { close: () => { } };
  }

  log(msg) {
    console.error(msg);
  }

  logLine(prefix, msg) {
    utils.writeLine(prefix, msg);
  }

  logClearLine() {
    utils.clearLine();
  }

  bind() {
    if (!this.argv.url) {
      this.fail('`options.url` must be specified to run tests');
    }
    this.mediator.on('width', () => {
      if (!this.client) {
        return;
      }
      const columns = parseInt(process.env.COLUMNS || process.stdout.columns) * 0.75 | 0;
      const expression = `Mocha.reporters.Base.window.width = ${columns};`;
      this.client.Runtime.evaluate({ expression });
    });
    this.mediator.on('started', (tests) => {
      this.started = true;
      if (this.argv.coverage) {
        this.nyc.reset();
      }
      this.logClearLine();
      this.log('Runner started\n');

      if (tests === 0) {
        this.fail('mocha.run() was called with no tests');
      }
    });

    this.mediator.on('ended', (stats) => {
      this.log('Runner ended\n');
      this.started = false;
      this.ended = true;
      this.isRunning = false;
      this.exit(stats.failures);
    });
  }

  fail(msg) {
    this.log(msg);
    this.exit(1);
  }

  pipeOut(Runtime) {
    Runtime.exceptionThrown((exception) => {
      this.log('[chrome-exception]', exception);
    });

    Runtime.consoleAPICalled(({ type, args }) => {
      if (type === 'info') {
        process.stdout.write(args.shift().value);
        return;
      }
      if (type === 'warning') {
        type = 'warn';
      }
      if (!(type in console)) {
        type = 'log';
      }
      const data = args.map(arg => (arg.type === 'string' ? arg.value : unmirror(arg)));
      console[type](...data);
    });
  }

  pipeNetwork(Network) {
    Network.requestWillBeSent((info) => {
      this.requests.set(info.requestId, info.request);
      if (!this.started && info.request.url.match(/^(file|http(s?)):\/\//)) {
        this.logLine('Loading', info.request.url);
      }
    });
    Network.loadingFailed((info) => {
      const { errorText } = info;
      const { url, method } = this.requests.get(info.requestId);
      const msg = JSON.stringify({ url, method, errorText });
      this.log('Resource Failed to Load:', msg);
      this.mediator.emit('resourceFailed', msg);
      this.loadError = true;
    });
  }

  launch(options) {
    return this.chromeLauncher.launch(options);
  }

  async setup() {
    if (this.argv.chrome.launch) {
      this.chrome = await this.launch(this.argv.chrome);
      const { port } = this.chrome;
      this.argv.client.port = port;
    }
    const awFiles = this.relativeBaseUrlFiles(this.testFiles);
    this.client = await connect(this.argv, awFiles, this.debugging);
    if (!this.client) {
      this.fail('CDP Client could not connect');
      return;
    }
    const { DOMStorage, Runtime, Network } = this.client;
    this.mediator.bind(DOMStorage);
    this.pipeOut(Runtime);
    this.pipeNetwork(Network);
    Network.clearBrowserCache();
  }

  async navigate() {
    if (this.loadError) {
      this.fail(`Failed to load the url: ${this.argv.url}`);
      return;
    }
    this.log(`Navigating to ${this.argv.url}`);
    this.isRunning = true;
    await this.client.Page.navigate({ url: this.argv.url });
  }

  getDependencies(f) {
    const cached = this.depMap.get(f);
    if (cached) {
      return cached;
    }
    const rf = utils.ensureFilePath(f);
    const deps = precinct(fs.readFileSync(rf, 'utf8'), { amd: { skipLazyLoaded: true } });
    this.depMap.set(f, deps);
    return deps;
  }

  matchDependencyName(srcName, deps) {
    for (const dep of deps) {
      const name = path.basename(dep);
      if (name === srcName) {
        return true;
      }
    }
    return false;
  }

  matchDependency(srcFile) {
    const cache = this.srcTestMap.get(srcFile);
    if (cache) {
      return cache;
    }
    const srcName = path.basename(srcFile).split('.').shift();
    for (const f of this.testFiles) {
      this.logLine('Scanning', f);
      const deps = this.getDependencies(f);
      const found = this.matchDependencyName(srcName, deps);
      if (found) {
        this.srcTestMap.set(srcFile, [f]);
        return [f];
      }
    }
    this.logClearLine();
    this.log(`Couldn't find a test file for ${srcFile}`);
    return [];
  }

  setupAndRunTests(testFiles) {
    this.isRunning = true;
    (async () => {
      if (!this.client) {
        await this.run();
        return;
      }
      const awFiles = this.relativeBaseUrlFiles(testFiles || this.testFiles);
      const injectAwFiles = `window.awFiles = ${JSON.stringify(awFiles)};`;
      await this.client.Page.reload({ ignoreCache: true, scriptToEvaluateOnLoad: injectAwFiles });
    })();
  }

  onWatch(virtualAbs, virtualRel) {
    if (this.isRunning) {
      return;
    }
    deleteTransform(virtualAbs);
    const ext = utils.getExt(virtualAbs);
    const abs = utils.getPathWithExt(virtualAbs, 'js');
    const rel = utils.getPathWithExt(virtualRel, 'js');
    let testFiles = [rel];
    if (this.depMap.get(abs)) {
      this.depMap.delete(abs);
    }
    this.all = false;
    const isTestFile = this.testFiles.indexOf(abs) !== -1;
    if (!isTestFile) {
      testFiles = this.matchDependency(abs);
      const nycOpts = Object.assign({}, this.argv.nyc, { exclude: ['**', `!${rel}`] });
      this.nyc = new NYC(nycOpts);
    } else {
      this.nyc = new NYC(this.argv.nyc);
    }
    this.onlyTestFiles = testFiles.map(f => utils.getPathWithExt(f, ext));
    this.setupAndRunTests(this.onlyTestFiles);
  }

  bindWatch() {
    if (this.argv.watch) {
      chokidar.watch(this.argv.watchGlob).on('change', f => this.onWatch(path.resolve(f), f));
    }
  }

  autoDetectDebug() {
    const exv = process.execArgv.join();
    const debug = exv.includes('inspect') || exv.includes('debug');
    if (debug || this.argv.chrome.devtools) {
      this.argv.mocha.timeout = 0;
      this.debugging = true;
    }
    return this;
  }

  relativeBaseUrlFile(file) {
    return path.relative(path.dirname(this.argv.url), path.resolve(file))
      .replace(/\\/g, '/')
      .replace(/.ts$/, '.js');
  }

  relativeBaseUrlFiles(files) {
    return files.map(file => this.relativeBaseUrlFile(file));
  }

  findFiles(glob) {
    return globby.sync(glob).map(f => path.resolve(f));
  }

  setTestFiles() {
    this.testFiles = this.argv.filter.chrome.files.reduce((acc, curr) => acc.filter(curr), this.findFiles(this.argv.glob));
    if (!this.testFiles.length) {
      this.log('No files found for:', this.argv.glob);
      this.exit(1);
    }
    return this;
  }

  setUrl(url) {
    if (!/^(file|http(s?)):\/\//.test(url)) {
      if (!fs.existsSync(url)) {
        url = `file://${path.resolve(path.join(process.cwd(), url))}`;
      }
      if (!fs.existsSync(url)) {
        this.log('You must specify an existing url.');
        this.exit(1);
      }
      url = `file://${fs.realpathSync(url)}`;
    }
    this.argv.url = url;
    return this;
  }

  maybeCreateServer() {
    if (/^(http(s?)):\/\//.test(this.argv.url)) {
      this.server = createServer(this.argv);
    }
    return this;
  }

  run() {
    (async () => {
      await this.setup();
      await this.navigate();
    })();
  }

  async extractCoverage() {
    const { result: { value } } = await this.client.Runtime.evaluate({ expression: 'window.__coverage__', returnByValue: true });
    return value;
  }

  exit(code) {
    (async () => {
      if (this.argv.coverage) {
        const coverage = await this.extractCoverage();
        fs.writeFileSync(
          path.resolve(this.nyc.tempDirectory(), `${Date.now()}.json`),
          JSON.stringify(coverage, null, 2),
          'utf8',
        );
        this.nyc.report();
      }
      if (this.argv.watch) {
        this.emit('watchEnd');
        return;
      }
      if (this.argv.interactive) {
        this.emit('interactive');
        return;
      }
      try {
        await this.client.close();
        if (this.argv.chrome.launch) {
          await this.chrome.kill();
        }
      } catch (err) {
        this.log(err);
      }
      this.server.close();
      process.exitCode = code;
    })();
  }
}

module.exports = Runner;
