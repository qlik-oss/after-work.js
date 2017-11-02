/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const options = require('./options');
const Runner = require('./runner');
const createHttpServer = require('./http-server');
const NYC = require('nyc');
const findUp = require('find-up');

process.on('unhandledRejection', (err) => {
  console.error(`Promise Rejection:${err}`);
});

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
        let foundConfigPath = configPath;
        if (!fs.existsSync(configPath)) {
          foundConfigPath = findUp.sync(options.config.default);
        }
        let config = {};
        try {
          config = require(foundConfigPath);
        } catch (_) {} //eslint-disable-line
        return config;
      })
      .coerce('nyc', (opt) => {
        opt.exclude = [...new Set(opt.defaultExclude.concat(opt.exclude))];
        opt.sourceMap = false;
        opt.instrumenter = './lib/instrumenters/noop';
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
    const runner = new Runner(argv, nyc);
    runner.on('exit', code => process.exit(code));

    (async function run() {
      await runner.run(relativeFiles);
    }());
  },
};

module.exports = cdp;