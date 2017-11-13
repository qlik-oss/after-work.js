/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const globby = require('globby');
const Mocha = require('mocha');
const chokidar = require('chokidar');
const importCwd = require('import-cwd');
const NYC = require('nyc');
const fs = require('fs');
const path = require('path');
const options = require('./options');

function runTests(firstRun, files, srcFiles, { coverage, nyc, mocha }) {
  // We need to wipe the global `__coverage__` to support watching
  delete global.__coverage__; // eslint-disable-line
  const n = new NYC(nyc);
  const m = new Mocha(mocha);
  if (coverage) {
    srcFiles.forEach((f) => {
      if (require.cache[f]) {
        delete require.cache[f];
      }
    });
    n.reset();
    if (firstRun) {
      n.wrap();
    }
  }
  files.forEach((f) => {
    if (require.cache[f]) {
      delete require.cache[f];
    }
    m.addFile(f);
  });
  if (coverage) {
    srcFiles.forEach(f => require(`${f}`));
  }

  const runner = m.run((failures) => {
    process.on('exit', () => {
      process.exit(failures);
    });
  });
  runner.on('end', () => {
    if (coverage) {
      n.writeCoverageFile();
      n.report();
    }
  });
  return () => {
    process.removeAllListeners();
    runner.removeAllListeners();
  };
}

const node = {
  command: ['node [options]', '$0'],
  desc: 'Run tests in node',
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
        if (opt.babel) {
          opt.require.push('babel-register');
          opt.sourceMap = false;
          opt.instrumenter = './lib/instrumenters/noop';
        }
        return opt;
      });
  },
  handler(argv) {
    const files = globby.sync(argv.glob).map(f => path.resolve(f));
    if (!files.length) {
      console.log('No files found for:', argv.glob);
      process.exit(1);
    }
    // We need to remove `babel-register` for coverage since NYC needs to require it for instrumentation
    if (argv.coverage && argv.nyc.babel && argv.require.includes('babel-register')) {
      const ix = argv.require.indexOf('babel-register');
      argv.require.splice(ix, 1);
    }
    const srcFiles = globby.sync(argv.src).map(f => path.resolve(f));
    argv.require.forEach(m => importCwd(m));
    let removeListeners = runTests(true, files, srcFiles, argv);
    if (argv.watch) {
      // We need to watch source files also
      chokidar.watch(argv.watchGlob).on('change', () => {
        removeListeners();
        removeListeners = runTests(false, files, srcFiles, argv);
      });
    }
  },
};

module.exports = node;


// if (typeof process.stdin.setRawMode === 'function') {
//   process.stdin.setRawMode(true);
//   process.stdin.resume();
//   process.stdin.setEncoding('hex');
//   process.stdin.on('data', (a, b) => {
//     console.log(a, b);
//   });
// }
