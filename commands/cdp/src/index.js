/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0, no-underscore-dangle: 0 */
const fs = require('fs');
const path = require('path');
const testExclude = require('test-exclude');
const importCwd = require('import-cwd');
const utils = require('@after-work.js/utils');
const options = require('./options');
const Runner = require('./runner');
// process.on('unhandledRejection', (err) => {
//   console.error(`Promise Rejection:${err}`);
// });

const cdp = {
  Runner,
  command: ['cdp', 'chrome'],
  desc: 'Run tests with cdp (chrome devtools protocol)',
  builder(yargs) {
    return yargs
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
          config = Object.assign({}, foundConfig());
        } else {
          config = Object.assign({}, foundConfig);
        }
        return config;
      })
      .coerce('babel', utils.coerceBabel)
      .coerce('instrument', (opt) => {
        const exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.testExclude = testExclude({ include: opt.include, exclude });
        return opt;
      })
      .coerce('transform', (opt) => {
        const exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.testExclude = testExclude({ include: opt.include, exclude });
        opt.typescript.compilerOptions = Object.assign({ compilerOptions: {} }, importCwd.silent(path.resolve(opt.typescript.config))).compilerOptions;
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
    argv.presetEnv.enable = false;
    require(argv.presetEnv.require)(runner, argv.filter.chrome);
    runner
      .autoDetectDebug()
      .setTestFiles()
      .setUrl(argv.url)
      .maybeCreateServer();
    if (argv.interactive) {
      runner.emit('interactive');
      return runner;
    }
    runner.run();
    return runner;
  },
};

module.exports = cdp;
