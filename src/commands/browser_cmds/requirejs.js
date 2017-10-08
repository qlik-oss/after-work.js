const path = require('path');
const extend = require('extend');
const Promise = require('bluebird');
const utils = require('../../commands-utils');

const rjs = {
  command: 'requirejs <config>',
  desc: 'Run in requirejs context',
  builder(yargs) {
    return yargs
      .usage('requirejs <config>')
      .config(utils.config.requirejs)
      .option('port', {
        description: 'Port',
        default: 9676,
        type: 'number',
      })
      .option('open', {
        description: 'Open browser',
        default: true,
        type: 'boolean',
      })
      .option('glob', {
        description: 'Glob pattern',
        type: 'string',
      })
      .option('coverage', {
        description: 'Generate coverage',
        type: 'boolean',
        default: false,
      })
      .argv;
  },
  handler(argv) {
    const cmd = 'requirejs';
    const config = utils.getConfig(cmd, argv.config);
    const blackList = config.coverageConfig.blackList.concat(argv.coverageConfig.blackList || []);
    argv = extend(true, config, argv);
    argv.coverageConfig.blackList = blackList.concat([path.basename(argv.main)]);
    // console.log(argv);
    const files = utils.getFiles(argv.glob);
    if (!files.length) {
      console.log('No files found for:', argv.glob);
      process.exit(0);
    }
    let coveragePromise = Promise.resolve({
      runner: {
        reload() { },
        exit() { },
      },
      nyc: {
        reset() { },
        report() { },
        writeCoverageFile() { },
        instrumenter() {
          return {
            instrumentSync() {},
          };
        },
      },
    });
    if (argv.coverage) {
      coveragePromise = new Promise(utils.onCoverageRunnerInit.bind(utils));
    }
    return coveragePromise.then(coverage => new Promise(utils.initRunner.bind(utils, cmd, argv, files, coverage)));
  },
};

module.exports = rjs;
