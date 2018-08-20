/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const chromeFinder = require('chrome-launcher/dist/chrome-finder');
const { getPlatform } = require('chrome-launcher/dist/utils');
const { Runner, configure } = require('@after-work.js/node/src/');
const nodeOptions = require('@after-work.js/node/src/options');
const utils = require('@after-work.js/utils');
const puppetOptions = require('./options');

const options = Object.assign({}, nodeOptions, puppetOptions);

class PuppetRunner extends Runner {
  constructor(puppeteer, argv, libs) {
    super(argv, libs);
    this.puppeteer = puppeteer;
    this.on('onFinished', failures => this.exit(failures));
    this.on('forceExit', () => this.closeBrowser());
  }

  async getChromeExecutablePath() {
    const installations = await chromeFinder[getPlatform()]();
    if (installations.length === 0) {
      throw new Error('Chrome not installed');
    }
    return installations.pop(); // If you have multiple installed chromes return regular chrome
  }

  async launch() {
    if (!this.argv.chrome.executablePath) {
      this.argv.chrome.executablePath = await this.getChromeExecutablePath();
    }
    if (this.argv.chrome.slowMo && this.argv.chrome.slowMo > 0) {
      this.argv.mocha.enableTimeouts = false;
    }

    this.browser = await this.puppeteer.launch(this.argv.chrome);
    global.browser = this.browser;
    const pages = await this.browser.pages();
    if (pages.length) {
      global.page = pages.shift();
    } else {
      global.page = await this.browser.newPage();
    }
  }

  closeBrowser() {
    (async () => {
      await this.browser.close();
    })();
  }

  exit(code) {
    if (this.argv.watch) {
      return;
    }
    process.exitCode = code;
    this.closeBrowser();
  }
}

const puppet = {
  Runner: PuppetRunner,
  command: ['puppeteer', 'puppet'],
  desc: 'Run tests with puppeteer',
  builder(yargs) {
    return yargs
      .options(options)
      .config('config', configure)
      .coerce('babel', utils.coerceBabel)
      .coerce('nyc', (opt) => {
        if (opt.babel) {
          opt.sourceMap = false; // eslint-disable-line no-param-reassign
          opt.instrumenter = './lib/instrumenters/noop'; // eslint-disable-line no-param-reassign
        }
        return opt;
      });
  },
  handler(argv) {
    (async function launchAndRun() {
      const puppeteer = require('puppeteer-core');
      if (argv.presetEnv) {
        require(argv.presetEnv);
      }
      const runner = new PuppetRunner(puppeteer, argv);
      await runner.launch();
      runner
        .addToMatchSnapshot()
        .autoDetectDebug()
        .setupKeyPress()
        .setTestFiles()
        .setSrcFiles()
        .require()
        .run();
    }());
  },
};

module.exports = puppet;
