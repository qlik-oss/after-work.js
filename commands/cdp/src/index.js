/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0, no-underscore-dangle: 0 */
const fs = require('fs');
const path = require('path');
const testExclude = require('test-exclude');
const importCwd = require('import-cwd');
const utils = require('@after-work.js/utils');
const options = require('./options');
const Runner = require('./runner');

const cdp = {
  Runner,
  command: ['cdp', 'chrome'],
  desc: 'Run tests with cdp (chrome devtools protocol)',
  builder(yargs) {
    return yargs
      .middleware(utils.addDefaults)
      .options(options)
      .config('config', (configPath) => {
        if (configPath === null) {
          return {};
        }
        if (!fs.existsSync(configPath)) {
          throw new Error(`Config ${configPath} not found`);
        }
        let config = {};
        const foundConfig = require(configPath);
        if (typeof foundConfig === 'function') {
          config = { ...foundConfig() };
        } else {
          config = { ...foundConfig };
        }
        return config;
      })
      .coerce('babel', utils.coerceBabel)
      .coerce('transform', (opt) => {
        const exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.testExclude = testExclude({ include: opt.include, exclude });
        // eslint-disable-next-line prefer-object-spread
        opt.typescript.compilerOptions = Object.assign(
          { compilerOptions: {} },
          importCwd.silent(path.resolve(opt.typescript.config)),
        ).compilerOptions;
        return opt;
      })
      .coerce('chrome', (opt) => {
        if (opt.devtools) {
          opt.chromeFlags = ['--auto-open-devtools-for-tabs'];
          opt.launch = true;
        }
        return opt;
      });
  },
  handler(argv) {
    const runner = new cdp.Runner(argv);
    let skipInitialInteractive = false;
    if (argv.watch && !argv.interactive) {
      skipInitialInteractive = true;
      argv.interactive = true;
    }
    if (argv.interactive) {
      require('@after-work.js/interactive-plugin')(runner);
    }
    if (argv.watch) {
      require('@after-work.js/watch-plugin')(runner);
    }
    runner
      .autoDetectDebug()
      .setTestFiles()
      .maybeCreateServer();
    if (!skipInitialInteractive && argv.interactive) {
      runner.emit('interactive');
      return runner;
    }
    runner.run();
    return runner;
  },
};

module.exports = cdp;
