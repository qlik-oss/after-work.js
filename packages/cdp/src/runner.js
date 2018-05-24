/* eslint no-console: 0, class-methods-use-this: 0, no-restricted-syntax: 0 */
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const chromeLauncher = require('chrome-launcher');
const unmirror = require('chrome-unmirror');
const chokidar = require('chokidar');
const globby = require('globby');
const precinct = require('precinct');
const createHttpServer = require('./http-server');
const NYC = require('nyc');
const Mediator = require('./mediator');
const connect = require('./connect');
const utils = require('@after-work.js/terminal-utils');
const { ensureFilePath, getExt, getPathWithExt } = require('@after-work.js/file-utils');

class Runner {
  constructor(argv = { chrome: { chromeFlags: [] }, client: {} }) {
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
    this.onlyTestFilesBrowser = [];
    this.all = true;
    this.bind();
    this.debugging = false;
  }
  logInfo(mode, testFiles) {
    if (this.debugging) {
      return this;
    }
    if (this.argv.outputReporterOnly) {
      return this;
    }
    console.log(`${mode}`);
    console.log('  test');
    testFiles.forEach((f) => {
      console.log(`    \u001b[90m${f}\u001b[0m`);
    });
    console.log('\nSave\u001b[90m a test file or source file to run only affected tests\u001b[0m');
    console.log('\u001b[90mPress\u001b[0m a \u001b[90mto run all tests\u001b[0m');
    return this;
  }
  log(msg) {
    if (this.argv.outputReporterOnly) {
      return;
    }
    console.log(msg);
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
  bind() {
    if (this.argv.chrome.devtools && this.argv.coverage) {
      this.log('Can not use coverage with devtools. Coverage set to false');
      this.argv.coverage = false;
    }
    if (!this.argv.url) {
      this.fail('`options.url` must be specified to run tests');
    }
    this.mediator.on('width', () => {
      if (!this.client) {
        return;
      }
      const columns = parseInt(process.env.COLUMNS || process.stdout.columns) * 0.75 | 0; // eslint-disable-line
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

    this.mediator.on('ended', async (stats) => {
      this.log('Runner ended\n');
      this.started = false;
      this.ended = true;
      this.isRunning = false;
      await this.exit(stats.failures);
    });
  }
  on(event, callback) {
    this.mediator.on(event, callback);
  }
  fail(msg) {
    console.error(msg);
    this.exit(1);
  }
  pipeOut(Runtime) {
    Runtime.exceptionThrown((exception) => {
      console.error('[chrome-exception]', exception);
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
        this.logLine(info.request.url);
      }
    });
    Network.loadingFailed((info) => {
      const { errorText } = info;
      const { url, method } = this.requests.get(info.requestId);
      const msg = JSON.stringify({ url, method, errorText });
      console.error('Resource Failed to Load:', msg);
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
    this.client = await connect(this.argv, this.testFilesBrowser, this.debugging);
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
    const rf = ensureFilePath(f);
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
      this.logLine(`Scanning ${f}`);
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
  async reloadAndRunTests(relativeFiles) {
    this.isRunning = true;
    const injectAwFiles = `window.awFiles = ${JSON.stringify(relativeFiles)};`;
    await this.client.Page.reload({ ignoreCache: true, scriptToEvaluateOnLoad: injectAwFiles });
  }
  async onWatch(virtualAbs, virtualRel) {
    if (this.isRunning) {
      return;
    }
    const ext = getExt(virtualAbs);
    const abs = getPathWithExt(virtualAbs, 'js');
    const rel = getPathWithExt(virtualRel, 'js');
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
    this.onlyTestFiles = testFiles.map(f => getPathWithExt(f, ext));
    this.onlyTestFilesBrowser = this.relativeBaseUrlFiles(testFiles);
    await this.reloadAndRunTests(this.onlyTestFilesBrowser);
  }
  watch() {
    chokidar.watch(this.argv.watchGlob).on('change', f => this.onWatch(path.resolve(f), f));
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
        this.exit(0, true);
      }
      if (this.isRunning) {
        return;
      }
      switch (str) {
        case 'a':
          this.all = true;
          this.nyc = new NYC(this.argv.nyc);
          this.reloadAndRunTests(this.testFilesBrowser);
          break;
        default: break;
      }
    });
    return this;
  }
  autoDetectDebug() {
    const exv = process.execArgv.join();
    const debug = exv.includes('inspect') || exv.includes('debug');
    if (debug || this.argv.chrome.devtools) {
      this.argv.mocha.timeout = 0;
      this.debugging = true;
    }
  }
  relativeRootFile(file) {
    return path.relative(path.relative(this.argv.url, process.cwd()), file);
  }
  relativeRootFiles(files) {
    return files.map(file => this.relativeRootFile(file));
  }
  relativeBaseUrlFile(file) {
    return path.relative(path.dirname(this.argv.url), path.resolve(file));
  }
  relativeBaseUrlFiles(files) {
    return files.map(file => this.relativeBaseUrlFile(file));
  }
  setTestFiles() {
    this.testFiles = globby.sync(this.argv.glob).map(f => path.resolve(f)).map((f) => {
      const parts = f.split('.');
      const ext = parts.pop();
      if (ext === 'ts') {
        return `${parts.join('.')}.js`;
      }
      return f;
    });
    if (!this.testFiles.length) {
      this.log('No files found for:', this.argv.glob);
      process.exit(1);
    }
    this.testFilesBrowser = this.relativeBaseUrlFiles(this.testFiles)
      .map(f => f.split('\\').join('/'));
    return this;
  }
  setUrl(url) {
    if (!/^(file|http(s?)):\/\//.test(url)) {
      if (!fs.existsSync(url)) {
        url = `file://${path.resolve(path.join(process.cwd(), url))}`;
      }
      if (!fs.existsSync(url)) {
        console.error('You must specify an existing url.');
        process.exit(1);
      }
      url = `file://${fs.realpathSync(url)}`;
    }
    this.argv.url = url;
    return this;
  }
  maybeCreateHttpServer() {
    if (/^(http(s?)):\/\//.test(this.argv.url)) {
      createHttpServer(this.argv);
    }
    return this;
  }
  async run() {
    await this.setup();
    await this.navigate();
    if (this.argv.watch) {
      this.watch();
    }
  }
  async extractCoverage() {
    const { result: { value } } = await this.client.Runtime.evaluate({ expression: 'window.__coverage__', returnByValue: true });
    return value;
  }
  async exit(code, force) {
    if (!force && this.argv.coverage) {
      const coverage = await this.extractCoverage();
      fs.writeFileSync(
        path.resolve(this.nyc.tempDirectory(), `${Date.now()}.json`),
        JSON.stringify(coverage, null, 2),
        'utf8'
      );
      this.nyc.report();
    }
    if (!force && this.argv.watch) {
      const mode = this.all ? 'All' : 'Only';
      const testFiles = this.all ? [`${this.argv.glob}`] : this.onlyTestFiles;
      this.logInfo(mode, testFiles);
      return;
    }
    await this.client.close();
    if (this.argv.chrome.launch) {
      await this.chrome.kill();
    }
    this.mediator.emit('exit', code);
  }
}

module.exports = Runner;
