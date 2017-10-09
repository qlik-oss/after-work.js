/* eslint no-console: 0 */
const utils = require('../../commands-utils');
const Mocha = require('mocha');

const mocha = {
  command: 'mocha [mocha.glob] [options]',
  desc: 'Run mocha',
  builder(yargs) {
    return yargs
      .usage('mocha [mocha.glob] [options]')
      .options(utils.config.mocha);
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
