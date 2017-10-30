/* eslint no-console: 0, max-len: 0 */
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const options = require('./options');
const Runner = require('./runner');
const server = require('./server');
const NYC = require('nyc');

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
      .options(options);
  },
  handler(argv) {
    const files = globby.sync(argv.glob);
    if (!files.length) {
      console.log('No files found for:', argv.glob);
      process.exit(1);
    }

    const relativeFiles = files.map(file => path.relative(path.dirname(argv.url), path.resolve(file)));
    argv.url = cdp.getUrl(argv.url);
    const nyc = new NYC(argv.nyc);

    server(argv.url, relativeFiles, argv.coverage, nyc, argv.http);

    const runner = new Runner(argv, nyc);
    runner.on('exit', code => process.exit(code));

    (async function run() {
      await runner.run(relativeFiles);
    }());
  },
};

module.exports = cdp;
