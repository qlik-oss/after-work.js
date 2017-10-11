/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const extend = require('extend');
const utils = require('../../commands-utils');
const Mocha = require('mocha');

const mocha = {
  options: {
    config: {
      description: 'Path to config file',
      type: 'string',
    },
    'mocha.glob': {
      description: 'Glob pattern',
      default: ['test/**/*.spec.js'],
      type: 'array',
    },
    'mocha.require': {
      description: 'Require path',
      default: [],
      type: 'array',
    },
    'mocha.watch': {
      description: 'Watch for changes',
      default: false,
    },
  },
  command: ['*', 'mocha [mocha.glob] [options]'],
  desc: 'Run mocha',
  builder(yargs) {
    return yargs
      .usage('mocha [mocha.glob] [options]')
      .options(mocha.options)
      .config('config', (configPath) => {
        const config = extend(true, {
        }, require(configPath));
        return config;
      });
  },
  handler(argv) {
    const files = utils.getFiles(argv.mocha.glob);
    if (!files.length) {
      console.log('No files found for:', argv.mocha.glob);
      process.exit(0);
    }
    const runner = new Mocha(argv.mocha);
    files.forEach(f => runner.addFile(f));
    runner.run((failures) => {
      process.on('exit', () => process.exit(failures));
    });
  },
};

module.exports = mocha;
