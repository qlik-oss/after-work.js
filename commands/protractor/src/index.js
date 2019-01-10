const path = require('path');
const importCwd = require('import-cwd');
const options = require('./options');

const protractor = {
  command: ['protractor', 'ptor'],
  desc: 'Run protractor',
  builder(yargs) {
    return yargs.options(options);
  },
  handler() {
    const launcherPath = 'protractor/built/launcher';
    const launcher = importCwd.silent(launcherPath) || require(launcherPath);
    launcher.init(path.resolve(__dirname, './config.js'));
  },
};

module.exports = protractor;
