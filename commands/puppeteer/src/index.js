/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const importCwd = require('import-cwd');
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
  }

  static async getChromeExecutablePath(stable) {
    if (!stable) {
      const launcher = importCwd.silent('puppeteer');
      if (!launcher) {
        throw new Error(
          'Cannot find Chromium. Make sure you have puppeteer installed',
        );
      }
      const exePath = launcher.executablePath();
      return exePath;
    }
    const installations = await chromeFinder[getPlatform()]();
    if (installations.length === 0) {
      throw new Error('Chrome not installed');
    }
    return installations.pop(); // If you have multiple installed chromes return regular chrome
  }

  async launch() {
    if (this.argv.chrome.slowMo && this.argv.chrome.slowMo > 0) {
      this.argv.mocha.enableTimeouts = false;
    }

    if (this.argv.launch) {
      this.browser = await this.puppeteer.launch(this.argv.chrome);
    } else {
      this.browser = await this.puppeteer.connect(this.argv.chrome);
    }

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
    this.closeBrowser();
    super.exit(code);
  }

  getFilter() {
    return this.argv.filter.puppeteer;
  }

  // Override register and skip warnings
  register() {
    if (this.argv.hookRequire) {
      require('@after-work.js/register')(
        this.argv,
        this.srcFiles,
        this.testFiles,
      );
    }
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
      .coerce('babel', utils.coerceBabel);
  },
  handler(argv) {
    (async function launchAndRun() {
      const puppeteer = require('puppeteer-core');
      if (!argv.chrome.executablePath) {
        argv.chrome.executablePath = await PuppetRunner.getChromeExecutablePath(
          argv.chrome.stable,
        );
      }
      const runner = new PuppetRunner(puppeteer, argv);
      if (argv.presetEnv) {
        require('@after-work.js/preset-plugin')(runner);
      }
      if (argv.interactive) {
        require('@after-work.js/interactive-plugin')(runner);
      }
      await runner.launch();
      runner
        .autoDetectDebug()
        .setTestFiles()
        .setSrcFiles()
        .require();
      if (argv.interactive) {
        runner.emit('interactive');
        return runner;
      }
      runner.run();
      return runner;
    }());
  },
};

module.exports = puppet;
