/* eslint global-require: 0, no-console: 0, import/no-unresolved: 0, import/no-extraneous-dependencies: 0, import/no-dynamic-require: 0, max-len: 0 */
const path = require('path');
const extend = require('extend');
const fs = require('fs');
const utils = require('@after-work.js/utils');
const globby = require('globby');
const options = require('./options');

const protractor = {
  command: ['protractor', 'ptor'],
  desc: 'Run protractor',
  getConfig(configPath) {
    const baseConfig = require('./config')();
    let foundConfig = {};
    if (fs.existsSync(configPath)) {
      const p = path.resolve(process.cwd(), configPath);
      foundConfig = require(p);
    }
    let protractorConfig = {};
    if (typeof foundConfig === 'function') {
      protractorConfig = extend(true, baseConfig, foundConfig(baseConfig));
    } else {
      protractorConfig = extend(true, baseConfig, foundConfig);
    }
    return protractorConfig;
  },
  builder(yargs) {
    return yargs
      .options(options)
      .config('config', protractor.getConfig)
      .coerce('babel', utils.coerceBabel);
  },
  handler(argv) {
    argv.shouldInstrument = () => false;
    argv.shouldTransform = f => argv.transform.testExclude.shouldInstrument(f);
    if (argv.presetEnv) {
      require('@after-work.js/preset-plugin')();
    }
    let launcher;
    try {
      launcher = require('protractor/built/launcher');
    } catch (_) {
      console.log('Could not load protractor/built/launcher');
      const p = `${path.resolve(
        process.cwd(),
      )}/node_modules/protractor/built/launcher`;
      console.log(`Trying: ${p}`);
      try {
        launcher = require(p);
      } catch (__) {
        console.log(
          'Protractor could not be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json',
        );
        process.exit(1);
      }
    }
    if (argv.hookRequire) {
      require('@after-work.js/register')(argv);
    }
    argv.require.map(require);
    if (argv.glob.length) {
      const specs = utils.filter(
        argv.filter.protractor.files,
        globby.sync(argv.glob),
      );
      argv.specs = specs;
    }
    launcher.init('', argv);
  },
};

module.exports = protractor;
