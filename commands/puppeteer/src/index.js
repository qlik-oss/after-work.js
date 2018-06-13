/* eslint global-require: 0, no-console: 0, import/no-unresolved: 0, import/no-extraneous-dependencies: 0, import/no-dynamic-require: 0, max-len: 0 */
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const options = require('./options');
const Mocha = require('mocha');

process.on('unhandledRejection', (err) => {
  console.error(`Promise Rejection:${err}`);
});

function runTests(files, mochaOpts) {
  return (resolve) => {
    const mocha = new Mocha(mochaOpts);
    files.forEach(f => mocha.addFile(f));
    mocha.run((failures) => {
      resolve(failures);
    });
  };
}
function run(files, mochaOpts) {
  return new Promise(runTests(files, mochaOpts));
}

const puppet = {
  command: ['puppeteer', 'puppet'],
  desc: 'Run tests with puppeteer',
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
      });
  },
  handler(argv) {
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (_) {
      console.log('Could not load puppeteer');
      const p = `${path.resolve(process.cwd())}/node_modules/puppeteer`;
      console.log(`Trying: ${p}`);
      try {
        puppeteer = require(p);
      } catch (__) {
        console.log('Puppeteer could not be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json');
        process.exit(1);
      }
    }
    const files = globby.sync(argv.glob);
    if (!files.length) {
      console.log('No test files found for:', argv.glob);
      process.exit(1);
    }
    (async function launchAndRun() {
      const browser = await puppeteer.launch(argv.chrome);
      global.browser = browser;
      global.page = await browser.newPage();
      const failures = await run(files, argv.mocha);
      await browser.close();
      process.exit(failures);
    }());
  },
};

module.exports = puppet;
