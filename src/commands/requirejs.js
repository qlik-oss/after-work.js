/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const extend = require('extend');
const Promise = require('bluebird');
const utils = require('../commands-utils');

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

const rjs = {
  options: {
    logLevel: {
      description: 'Log level for http server',
      default: 'silent',
      type: 'string',
    },
    port: {
      description: 'Port',
      default: 9676,
      type: 'number',
    },
    open: {
      description: 'Open browser',
      default: true,
      type: 'boolean',
    },
    glob: {
      description: 'Glob pattern',
      type: 'array',
      default: [],
    },
    coverage: {
      description: 'Generate coverage',
      type: 'boolean',
      default: false,
    },
    coverageConfig: {
      blackList: [],
    },
    phantomjs: {
      description: 'Run phantomjs',
      type: 'boolean',
      default: false,
    },
    singleRun: {
      description: 'Run once',
      type: 'boolean',
      default: false,
    },
    config: {
      description: 'Path to config file',
      type: 'string',
      demandOption: true,
    },
    path: {
      description: 'Path to require.js lib',
      type: 'string',
      demandOption: true,
    },
    main: {
      description: 'Path to require.js main entry file',
      type: 'string',
      demandOption: true,
    },
  },
  command: 'requirejs',
  desc: 'Run in requirejs context',
  builder(yargs) {
    return yargs
      .usage('requirejs')
      .options(rjs.options)
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
        if (argv.phantomjs) {
          utils.runPhantom(url, argv.singleRun);
        }
      });
  },
};

module.exports = rjs;
