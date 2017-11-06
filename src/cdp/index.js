/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0, no-underscore-dangle: 0 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const rimraf = require('rimraf');
const globby = require('globby');
const options = require('./options');
const Runner = require('./runner');
const createHttpServer = require('./http-server');
const NYC = require('nyc');

process.on('unhandledRejection', (err) => {
  console.error(`Promise Rejection:${err}`);
});

function remove(f) {
  return (resolve, reject) => {
    rimraf(f, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  };
}

function remover(f) {
  return new Promise(remove(f));
}

const cdp = {
  getUrl(url) {
    if (!/^(file|http(s?)):\/\//.test(url)) {
      if (!fs.existsSync(url)) {
        url = `file://${path.resolve(path.join(process.cwd(), url))}`;
      }
      if (!fs.existsSync(url)) {
        console.error('You must specify an existing url.');
        process.exit(1);
      }
      url = `file://${fs.realpathSync(url)}`;
    }
    return url;
  },
  command: ['cdp [options]', 'chrome'],
  desc: 'Run tests with cdp (chrome devtools protocol)',
  builder(yargs) {
    return yargs
      .usage('cdp [options]')
      .options(options)
      .config('config', (configPath) => {
        if (!fs.existsSync(configPath)) {
          return {};
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
        opt.exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.sourceMap = false;
        opt.instrumenter = './lib/instrumenters/noop';
        return opt;
      })
      .coerce('chrome', (opt) => {
        if (opt.devtools) {
          opt.chromeFlags = ['--auto-open-devtools-for-tabs'];
          opt.launch = true;
        }
        if (!opt.chromeFlags.includes('--user-data-dir')) {
          opt.__userDataDir__ = path.resolve(os.tmpdir(), 'aw-test-profile');
          opt.chromeFlags.push(`--user-data-dir=${opt.__userDataDir__}`);
        }
        return opt;
      });
  },
  handler(argv) {
    const files = globby.sync(argv.glob);
    if (!files.length) {
      console.log('No test files found for:', argv.glob);
      process.exit(1);
    }
    const nyc = new NYC(argv.nyc);
    const relativeFiles = files.map(file => path.relative(path.dirname(argv.url), path.resolve(file)));

    argv.url = cdp.getUrl(argv.url);
    if (/^(http(s?)):\/\//.test(argv.url)) {
      createHttpServer(relativeFiles, argv.coverage, nyc, argv.http);
    }
    const exv = process.execArgv.join();
    const debug = exv.includes('inspect') || exv.includes('debug');
    if (debug || argv.chrome.devtools) {
      argv.mocha.timeout = 0;
    }

    const runner = new Runner(argv, nyc);
    runner.on('exit', code => process.exit(code));

    (async function run() {
      await runner.run(relativeFiles);
      await remover(argv.chrome.__userDataDir__);
    }());
  },
};

module.exports = cdp;
