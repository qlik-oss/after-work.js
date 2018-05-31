/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0, no-underscore-dangle: 0 */
const fs = require('fs');
const path = require('path');
const testExclude = require('test-exclude');
const importCwd = require('import-cwd');
const options = require('./options');

process.on('unhandledRejection', (err) => {
  console.error(`Promise Rejection:${err}`);
});

const cdp = {
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
      .coerce('nyc', (opt) => {
        opt.sourceMap = false; // eslint-disable-line no-param-reassign
        opt.instrumenter = './lib/instrumenters/noop'; // eslint-disable-line no-param-reassign
        return opt;
      })
      .coerce('instrument', (opt) => {
        const exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.testExclude = testExclude({ include: opt.include, exclude }); // eslint-disable-line no-param-reassign
        return opt;
      })
      .coerce('transform', (opt) => {
        const exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.testExclude = testExclude({ include: opt.include, exclude }); // eslint-disable-line no-param-reassign
        opt.typescript.compilerOptions = Object.assign({ compilerOptions: {} }, importCwd.silent(path.resolve(opt.typescript.config))).compilerOptions; // eslint-disable-line no-param-reassign
        return opt;
      })
      .coerce('chrome', (opt) => {
        if (opt.devtools) {
          opt.chromeFlags = ['--auto-open-devtools-for-tabs']; // eslint-disable-line no-param-reassign
          opt.launch = true; // eslint-disable-line no-param-reassign
        }
        return opt;
      });
  },
  handler(argv) {
    const Runner = require('./runner');
    const runner = new Runner(argv);
    runner.on('exit', code => process.exit(code));
    runner
      .setTestFiles()
      .setUrl(argv.url)
      .maybeCreateServer()
      .setupKeyPress()
      .autoDetectDebug();

    (async function run() {
      await runner.run();
    }());
  },
};

module.exports = cdp;
