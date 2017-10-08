/* eslint no-unused-expressions:0, prefer-destructuring: 0, no-console: 0, import/no-dynamic-require: 0, quote-props: 0, max-len: 0 */
const utils = require('../../commands-utils');
const path = require('path');
const fs = require('fs');
const spawn = require('../../spawn');

const foundNycConfig = fs.existsSync(path.resolve(process.cwd(), '.nycrc'));

const cover = {
  command: 'cover',
  desc: 'Generate coverage',
  builder(yargs) {
    yargs
      .command(['*', 'mocha'], 'Run mocha test', (yMocha) => {
        const coverArgv = yMocha
          .config(utils.config.cover)
          .argv;

        const nycBin = require.resolve('.bin/nyc');
        const mochaBin = require.resolve('.bin/mocha');

        let nycArgs = [];
        if (foundNycConfig) {
          console.log('Found nyc options for the repository, no defaults will be used');
        } else {
          nycArgs = utils.getArgs(coverArgv, 'nyc');
          let foundBabelPluginIstanbul = true;
          try {
            require.resolve('babel-plugin-istanbul');
          } catch (_) {
            foundBabelPluginIstanbul = false;
          }
          if (foundBabelPluginIstanbul) {
            console.log('babel-plugin-istanbul installed, source-maps and instrument set to false');
            nycArgs.push('--source-map', false);
            nycArgs.push('--instrument', false);
          }
        }
        const mochaArgs = utils.getArgs(coverArgv, 'mocha');
        const args = nycArgs.concat(mochaBin).concat(mochaArgs.concat('--require', utils.globalMochaRequire));
        // console.log(args);
        spawn(nycBin, args);
      })
      .argv;
  },
  // handler(argv) {
  //   console.log('cover', argv);
  // },
};

module.exports = cover;
