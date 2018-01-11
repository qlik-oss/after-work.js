/* eslint global-require: 0, no-console: 0, import/no-unresolved: 0, import/no-extraneous-dependencies: 0, import/no-dynamic-require: 0, max-len: 0 */
const path = require('path');
const initConfig = require('./config');
const extend = require('extend');
const fs = require('fs');
const options = require('./options');

const protractor = {
  command: ['protractor', 'ptor'],
  desc: 'Run protractor',
  getConfig(argv) {
    const baseConfig = initConfig();
    if (!fs.existsSync(argv.config)) {
      throw new Error(`Config ${argv.config} not found`);
    }
    let config = {};
    const p = path.resolve(process.cwd(), argv.config);
    const foundConfig = require(p);
    if (typeof foundConfig === 'function') {
      config = extend(true, baseConfig, argv, foundConfig(baseConfig));
    } else {
      config = extend(true, baseConfig, argv, foundConfig);
    }
    return config;
  },
  builder(yargs) {
    return yargs
      .options(options);
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
        process.exit(1);
      }
    }
    const config = protractor.getConfig(argv);
    argv.require.map(require);
    if (argv.glob.length) {
      config.specs = argv.glob;
    }

    launcher.init('', config);
  },
};

module.exports = protractor;
