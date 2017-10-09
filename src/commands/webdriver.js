/* eslint global-require: 0, no-console: 0, import/no-unresolved: 0, import/no-extraneous-dependencies: 0, import/no-dynamic-require: 0, max-len: 0 */
const path = require('path');
const utils = require('../commands-utils');
const initConfig = require('../config/webdriver-config');

const webdriver = {
  command: 'webdriver <config>',
  desc: 'Run webdriver',
  builder(yargs) {
    return yargs
      .usage('webdriver <config>')
      .config(utils.config.webdriver)
      .option('glob', {
        description: 'Glob pattern',
        type: 'string',
        default: [],
      })
      .option('coverage', {
        description: 'Generate coverage',
        type: 'boolean',
        default: false,
      })
      .option('artifactsPath', {
        description: 'Path to artifacts',
        type: 'string',
        default: 'test/component/artifacts',
      })
      .argv;
  },
  handler(argv) {
    let launcher;
    try {
      launcher = require('protractor/built/launcher');
    } catch (_) {
      console.log('Could not load protractor/built/launcher');
      const p = `${path.resolve(process.cwd())}/node_modules/protractor/built/launcher`;
      console.log(`Trying: ${p}`);
      try {
        launcher = require(p);
      } catch (__) {
        console.log('Protractor could not be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json');
        process.exit(0);
      }
    }
    const config = utils.getConfig('webdriver', argv.config, initConfig(argv.artifactsPath));
    const files = utils.getFiles(argv.glob);
    if (!files.length) {
      console.log('No files found for:', argv.glob);
      process.exit(0);
    }
    config.specs = files;
    launcher.init('', config);
  },
};

module.exports = webdriver;
