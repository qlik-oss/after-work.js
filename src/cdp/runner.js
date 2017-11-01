/* eslint no-console: 0, class-methods-use-this: 0 */
const chromeLauncher = require('chrome-launcher');
const unmirror = require('chrome-unmirror');
const Mediator = require('./mediator');
const connect = require('./connect');

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
      this.nyc.reset();
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
  pipeError(Network) {
    Network.requestWillBeSent(info => this.requests.set(info.requestId, info.request));
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
    if (!this.options.debug) {
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
    this.pipeError(Network);
    Network.clearBrowserCache();
  }
  async navigate() {
    if (this.loadError) {
      this.fail(`Failed to load the url:${this.options.url}`);
      return;
    }
    await this.client.Page.navigate({ url: this.options.url });
  }
  async run(files) {
    await this.setup(files);
    await this.navigate();
  }
  async extractCoverage() {
    const { result: { value } } = await this.client.Runtime.evaluate({ expression: 'new Function("return this")()["__coverage__"];', returnByValue: true });
    return value;
  }
  async exit(code) {
    if (this.options.coverage) {
      global.__coverage__ = await this.extractCoverage(); // eslint-disable-line
      this.nyc.writeCoverageFile();
      this.nyc.report();
    }
    await this.client.close();
    if (!this.options.debug) {
      await this.chrome.kill();
    }
    this.mediator.emit('exit', code);
  }
}

module.exports = Runner;
