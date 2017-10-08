const utils = require('../../commands-utils');
const spawn = require('../../spawn');

const mocha = {
  command: 'mocha [glob] [options]',
  desc: 'Run mocha',
  builder(yargs) {
    return yargs
      .usage('mocha [glob] [options]')
      .config(utils.config.mocha)
      .option('glob', {
        description: 'Glob pattern',
        default: ['test/**/*.spec.js'],
        type: 'array',
      })
      .option('require', {
        description: 'Require path',
        default: [],
        type: 'array',
      });
  },
  handler(argv) {
    // console.log('mocha', argv);
    const mochaBin = require.resolve('.bin/mocha');
    argv.require.push(utils.globalMochaRequire);
    const mochaArgs = argv.glob.concat(argv.require.reduce((args, val) => {
      args.push('--require');
      args.push(val);
      return args;
    }, []));
    spawn(mochaBin, mochaArgs);
  },
};

module.exports = mocha;
