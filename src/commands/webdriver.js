/* eslint global-require: 0, no-console: 0, import/no-unresolved: 0, import/no-extraneous-dependencies: 0, import/no-dynamic-require: 0, max-len: 0 */
const path = require('path');
const utils = require('../commands-utils');
const initConfig = require('../config/webdriver-config');
const findUp = require('find-up');
const extend = require('extend');
const fs = require('fs');

const command = {
  command: 'webdriver',
  desc: 'Run webdriver',
  options: {
    config: {
      description: 'Path to config file',
      type: 'string',
      default: 'aw.config.js',
    },
    glob: {
      description: 'Glob pattern',
      type: 'string',
      default: [],
    },
    coverage: {
      description: 'Generate coverage',
      type: 'boolean',
      default: false,
    },
    require: {
      description: 'Require path',
      default: [],
      type: 'array',
    },
  },
  getConfig(configPath) {
    let foundConfigPath = configPath;
    if (!fs.existsSync(configPath)) {
      foundConfigPath = findUp.sync(command.options.config.default);
    }
    let config = {};
    const baseConfig = initConfig();
    try {
      const p = path.resolve(process.cwd(), foundConfigPath);
      const foundConfig = require(p);
      if (typeof foundConfig === 'function') {
        config = extend(true, baseConfig, foundConfig());
      } else {
        config = extend(true, baseConfig, foundConfig);
      }
    } catch (_) {
      console.log('Using default config');
    }
    return config;
  },
  builder(yargs) {
    return yargs
      .usage('webdriver')
      .options(command.options)
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
    const config = command.getConfig(argv.config);
    argv.require.map(require);
    if (argv.glob.length) {
      config.specs = argv.glob;
    }
    const files = utils.getFiles(config.specs);
    if (!files.length) {
      console.log('No files found for:', config.specs);
      process.exit(0);
    }

    launcher.init('', config);
  },
};

module.exports = command;
