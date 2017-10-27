/* eslint no-console: 0, max-len: 0 */
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const options = require('./options');
const Runner = require('./runner');

process.on('unhandledRejection', (err) => {
  console.error(`Promise Rejection:${err}`);
});

const cdp = {
  command: ['cdp [options]', 'chrome'],
  desc: 'Run tests with cdp (chrome devtools protocol)',
  builder(yargs) {
    return yargs
      .usage('cdp [options]')
      .options(options);
  },
  handler(argv) {
    (async function run() {
      const files = await globby(argv.glob);
      if (!files.length) {
        console.log('No files found for:', argv.glob);
        process.exit(1);
      }
      const relativeFiles = files.map(file => path.relative(path.dirname(argv.url), path.resolve(file)));
      argv.url = `file://${fs.realpathSync(argv.url)}`;
      const runner = new Runner(argv);

      runner.on('ended', () => { });
      runner.on('exit', code => process.exit(code));

      await runner.setup();
      await runner.client.Page.addScriptToEvaluateOnLoad({ scriptSource: `window.awFiles = ${JSON.stringify(relativeFiles)}` });
      await runner.run();
    }());
  },
};

module.exports = cdp;
