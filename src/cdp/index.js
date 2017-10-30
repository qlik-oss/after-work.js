/* eslint no-console: 0, max-len: 0 */
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const options = require('./options');
const Runner = require('./runner');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const instrument = require('./instrument');
const NYC = require('nyc');

const app = new Koa();

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

    if (/^(http(s?)):\/\//.test(argv.url)) {
      app.use(favicon(path.resolve(__dirname, '../../aw.png')));
      if (argv.coverage) {
        app.use(instrument(relativeFiles, nyc));
      }
      app.use(serve(process.cwd()));
      app.use(...argv.http.root.map(root => serve(path.resolve(process.cwd(), root))));
      app.listen(argv.http.port);
    }
    const runner = new Runner(argv, nyc);
    runner.on('exit', (code) => {
      process.exitCode = code;
      process.exit(code);
    });
    (async function run() {
      await runner.run(relativeFiles);
    }());
  },
};

module.exports = cdp;
