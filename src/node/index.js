/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const extend = require('extend');
const globby = require('globby');
const Mocha = require('mocha');
const chokidar = require('chokidar');
const NYC = require('nyc');
const findUp = require('find-up');
const fs = require('fs');
const path = require('path');
const options = require('./options');

function runTests(files, { coverage, nyc, mocha }) {
  const n = new NYC(nyc);
  const m = new Mocha(mocha);
  files.forEach((f) => {
    Object.keys(require.cache).forEach((key) => {
      if (key.indexOf(f) !== -1) {
        delete require.cache[key];
      }
    });
    m.addFile(f);
  });
  if (coverage) {
    n.reset();
    n.wrap();
    n.addAllFiles();
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
}

const node = {
  command: ['*', 'node [options]'],
  desc: 'Run tests in node',
  builder(yargs) {
    return yargs
      .usage('node [options]')
      .options(options)
      .config('config', (configPath) => {
        let foundConfigPath = configPath;
        if (!fs.existsSync(configPath)) {
          foundConfigPath = findUp.sync(options.config.default);
        }
        let config = {};
        try {
          const foundConfig = require(foundConfigPath);
          if (typeof foundConfig === 'function') {
            config = extend(true, {}, foundConfig());
          } else {
            config = extend(true, {}, foundConfig);
          }
        } catch (_) {
          console.log('Using default config');
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
    const files = globby.sync(argv.glob);
    if (!files.length) {
      console.log('No files found for:', argv.glob);
      process.exit(1);
    }
    argv.require.forEach((m) => {
      require(`${path.resolve(process.cwd())}/node_modules/${m}`);
    });
    runTests(files, argv);
    if (argv.watch) {
      // We need to watch source files also
      chokidar.watch(files).on('change', () => {
        runTests(files, argv);
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
