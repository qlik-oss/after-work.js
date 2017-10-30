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
      this.started = true;
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

    this.mediator.on('resourceFailed', () => {
      this.loadError = true;
    });
  }
  on(event, callback) {
    this.mediator.on(event, callback);
  }
  fail(msg) {
    console.error(msg);
    this.exit(1);
  }
  injectFiles(files) {
    return this.client.Page.addScriptToEvaluateOnLoad({ scriptSource: `window.awFiles = ${JSON.stringify(files)}` });
  }
  async extractCoverage() {
    const { result: { value } } = await this.client.Runtime.evaluate({ expression: 'window.__coverage__;', returnByValue: true });
    return value;
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
  async exit(code) {
    if (this.options.coverage) {
      global.__coverage__ = await this.extractCoverage(); // eslint-disable-line
      this.nyc.writeCoverageFile();
      this.nyc.report();
    }
    // this.closed = true;
    // if (this.client) {
    await this.client.close();
    // }
    await this.chrome.kill();
    this.mediator.emit('exit', code);
  }
  launch(options) {
    return this.chromeLauncher.launch(options);
  }
  async setup() {
    this.chrome = await this.launch(this.options.chrome);
    const { port } = this.chrome;
    const options = { client: { port }, mocha: this.options.mocha };
    this.client = await connect(options);
    if (!this.client) {
      this.fail('CDP Client could not connect');
      return;
    }
    const { DOMStorage, Runtime, Network } = this.client;
    this.mediator.bind(DOMStorage);
    this.pipeOut(Runtime);

    Network.loadingFailed((info) => {
      const msg = JSON.stringify(info);
      console.error('Resource Failed to Load:', msg);
      this.mediator.emit('resourceFailed', msg);
    });
    // network(this.bus, log, Network, this.options.ignoreResourceErrors);
  }
  async navigate() {
    if (this.loadError) {
      this.fail(`Failed to load the url:${this.options.url}`);
      return;
    }
    await this.client.Page.navigate({ url: this.options.url });
  }
  async run(files) {
    await this.setup();
    await this.injectFiles(files);
    await this.navigate();
  }
}

module.exports = Runner;
