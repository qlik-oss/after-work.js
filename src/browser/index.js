/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const extend = require('extend');
const Promise = require('bluebird');
const utils = require('./commands-utils');
const options = require('./options');

const awBlackList = ['require.js', 'mocha.js', 'chai.js', 'sinon.js', 'setup.js'];
const runner = {
  reload() { },
  exit() { },
};
const nyc = {
  reset() { },
  report() { },
  writeCoverageFile() { },
  instrumenter() {
    return {
      instrumentSync() { },
    };
  },
};

const browser = {
  command: 'browser',
  desc: 'Run in browser context',
  builder(yargs) {
    return yargs
      .usage('browser')
      .options(options)
      .config('config', (configPath) => {
        const config = extend(true, {
          coverageConfig: { blackList: [] },
        }, require(configPath));
        config.coverageConfig.blackList.push(...awBlackList);
        return config;
      });
  },
  handler(argv) {
    const files = utils.getFiles(argv.glob);
    if (!files.length) {
      console.log('No files found for:', argv.glob);
      process.exit(0);
    }
    if (argv.phantomjs) {
      argv.open = false;
    }
    let coveragePromise = Promise.resolve({
      runner,
      nyc,
    });
    if (argv.coverage) {
      coveragePromise = new Promise(utils.onCoverageRunnerInit.bind(utils));
    }
    return coveragePromise
      .then(coverage => new Promise(utils.initRunner.bind(utils, 'requirejs', argv, files, coverage)))
      .then((url) => {
        if (argv.chromeHeadless) {
          utils.runChromeHeadless(url);
        } else if (argv.phantomjs) {
          utils.runPhantom(url, argv.singleRun);
        }
      });
  },
};

module.exports = browser;
