/* eslint no-console: 0, class-methods-use-this: 0 */
const chromeLauncher = require('chrome-launcher');
const unmirror = require('chrome-unmirror');
const Mediator = require('./mediator');
const connect = require('./connect');
const utils = require('../terminal-utils');

class Runner {
  constructor(options = { chrome: { chromeFlags: [] }, client: {} }, nyc) {
    this.options = options;
    this.nyc = nyc;
    this.mediator = new Mediator();
    this.chromeLauncher = chromeLauncher;
    this.ended = false;
    this.loadError = false;
    this.requests = new Map();
    this.bind();
    this.loadingStart = null;
    this.started = false;
  }
  bind() {
    if (!this.options.url) {
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
      if (this.options.coverage) {
        this.nyc.reset();
      }
      const loadingEnd = process.hrtime(this.loadingStart);
      utils.clearLine();
      console.log(`Loading time: ${loadingEnd[0]}s ${loadingEnd[1] / 1000000}ms`);
      console.log('');
      console.log('Runner started\n');

      if (tests === 0) {
        this.fail('mocha.run() was called with no tests');
      }
    });

    this.mediator.on('ended', async (stats) => {
      console.log('Runner ended\n');
      this.ended = true;
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
      if (this.requests.size === 0) {
        this.loadingStart = process.hrtime();
      }
      this.requests.set(info.requestId, info.request);
      if (!this.started && info.request.url.match(/^(file|http(s?)):\/\//)) {
        utils.writeLine(info.request.url);
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
  async setup(files) {
    if (this.options.chrome.launch) {
      this.chrome = await this.launch(this.options.chrome);
      const { port } = this.chrome;
      this.options.client.port = port;
    }
    this.client = await connect(this.options, files);
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
      this.fail(`Failed to load the url: ${this.options.url}`);
      return;
    }
    console.log(`Navigating to ${this.options.url}`);
    await this.client.Page.navigate({ url: this.options.url });
  }
  async run(files) {
    await this.setup(files);
    await this.navigate();
  }
  async extractCoverage() {
    const { result: { value } } = await this.client.Runtime.evaluate({ expression: 'window.__coverage__', returnByValue: true });
    return value;
  }
  async exit(code) {
    if (this.options.coverage) {
      const coverageStart = process.hrtime();
      global.__coverage__ = await this.extractCoverage(); // eslint-disable-line
      this.nyc.writeCoverageFile();
      this.nyc.report();
      const coverageEnd = process.hrtime(coverageStart);
      console.log(`Coverage write time: ${coverageEnd[0]}s ${coverageEnd[1] / 1000000}ms`);
      console.log('');
    }
    await this.client.close();
    if (this.options.chrome.launch) {
      await this.chrome.kill();
    }
    this.mediator.emit('exit', code);
  }
}

module.exports = Runner;
