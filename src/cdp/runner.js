/* eslint no-console: 0 */
const Mediator = require('./mediator');
const launch = require('./launcher');
const connect = require('./connect');
const chromeOut = require('./chrome-out');

class Runner {
  constructor(options = { chrome: { chromeFlags: [] }, client: {} }) {
    this.options = options;
    this.mediator = new Mediator();
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
      // console.log(`Test Run Started - Running ${tests} Tests\n`);

      if (tests === 0) {
        this.fail('mocha.run() was called with no tests');
      }
    });

    this.mediator.on('ended', (stats) => {
      this.ended = true;
      this.exit(stats.failures);
    });

    this.mediator.on('resourceFailed', () => {
      this.loadError = true;
    });
  }
  on(event, callback) {
    this.mediator.on(event, callback);
  }
  fail(msg) {
    console.log(msg);
    this.exit(1);
  }
  async exit(code) {
    this.closed = true;
    if (this.client) {
      await this.client.close();
    }
    await this.chrome.kill();
    this.mediator.emit('exit', code);
  }
  async setup() {
    this.chrome = await launch(this.options.chrome);
    const { port } = this.chrome;
    const options = { client: { port }, mocha: this.options.mocha };
    const client = await connect(options);
    if (!client) {
      this.fail('CDP Client could not connect');
      return;
    }
    const { DOMStorage, Runtime, Network } = client;
    this.mediator.bind(DOMStorage);
    chromeOut(Runtime);
    this.client = client;
    Network.loadingFailed((info) => {
      const msg = JSON.stringify(info);
      console.error('Resource Failed to Load:', msg);
      this.mediator.emit('resourceFailed', msg);
    });
    // network(this.bus, log, Network, this.options.ignoreResourceErrors);
  }

  async run() {
    if (!this.client) {
      return;
    }
    if (this.closed) {
      return;
    }
    if (this.loadError) {
      this.fail(`Failed to load the url:${this.options.url}`);
      return;
    }
    await this.client.Page.navigate({ url: this.options.url });
  }
}

module.exports = Runner;
