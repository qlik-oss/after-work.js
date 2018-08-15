/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0 */
const chromeFinder = require('chrome-launcher/dist/chrome-finder');
const { getPlatform } = require('chrome-launcher/dist/utils');
const { Runner, configure } = require('@after-work.js/node/src/');
const nodeOptions = require('@after-work.js/node/src/options');
const utils = require('@after-work.js/utils');
const puppetOptions = require('./options');

const options = Object.assign({}, nodeOptions, puppetOptions);

const getChromeExecutablePath = async () => {
  const installations = await chromeFinder[getPlatform()]();
  if (installations.length === 0) {
    throw new Error('Chrome not installed');
  }
  return installations[0];
};

const puppet = {
  command: ['puppeteer', 'puppet'],
  desc: 'Run tests with puppeteer',
  builder(yargs) {
    return yargs
      .options(options)
      .config('config', configure)
      .coerce('babel', utils.coerceBabel)
      .coerce('nyc', (opt) => {
        if (opt.babel) {
          // opt.require.push('babel-register');
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
      const runner = new Runner(argv);
      if (!argv.chrome.executablePath) {
        argv.chrome.executablePath = await getChromeExecutablePath(); //eslint-disable-line
      }
      const browser = await puppeteer.launch(argv.chrome);
      global.browser = browser;
      global.page = await browser.newPage();
      const closeBrowser = () => {
        (async function close() {
          await browser.close();
        }());
      };
      runner.on('onFinished', failures => runner.exit(failures));
      runner.on('forceExit', closeBrowser);
      runner.exit = (code) => {
        if (argv.watch) {
          return;
        }
        process.exitCode = code;
        closeBrowser();
      };
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
