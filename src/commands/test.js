/* eslint no-console: 0, max-len: 0, global-require: 0, import/no-dynamic-require: 0 */
const extend = require('extend');
const utils = require('../commands-utils');
const Mocha = require('mocha');
const chokidar = require('chokidar');
const NYC = require('nyc');
const findUp = require('find-up');
const fs = require('fs');

function runTests(files, { coverage, nyc, mocha }) {
  const n = new NYC(nyc);
  if (coverage) {
    n.reset();
    n.wrap();
    n.addAllFiles();
  }
  const m = new Mocha(mocha);
  files.forEach((f) => {
    Object.keys(require.cache).forEach((key) => {
      if (key.indexOf(f) !== -1) {
        delete require.cache[key];
      }
    });
    m.addFile(f);
  });

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

const command = {
  options: {
    config: {
      description: 'Path to config file',
      type: 'string',
      default: 'aw.config.js',
    },
    watch: {
      description: 'Watch changes',
      default: false,
      type: 'boolean',
    },
    coverage: {
      description: 'Generate coverage',
      default: false,
      type: 'boolean',
    },
    'nyc.require': {
      description: 'Require path',
      default: [],
      type: 'array',
    },
    'nyc.include': {
      description: 'Include glob',
      default: [],
      type: 'array',
    },
    'nyc.exclude': {
      description: 'Exclude glob',
      default: [],
      type: 'array',
    },
    'nyc.sourceMap': {
      description: 'Should nyc detect and handle source maps?',
      default: true,
      type: 'boolean',
    },
    'nyc.babel': {
      description: 'Sets up a preferred babel test environment e.g `process.env.NODE_ENV=test`, add `babel-register` to `nyc.require` `nyc.sourceMap=false` and `nyc.instrument=./lib/instrumenters/noop`',
      default: true,
      type: 'boolean',
    },
    'nyc.tempDirectory': {
      description: 'Directory to output raw coverage information to',
      default: './coverage/.nyc_output',
      type: 'string',
    },
    'nyc.reporter': {
      description: 'Coverage reporter(s) to use',
      default: ['text', 'lcov', 'text-summary'],
      type: 'array',
    },
    'nyc.reporterDir': {
      description: 'Directory to output coverage reports in',
      default: 'coverage',
      type: 'string',
    },
    'mocha.glob': {
      description: 'Glob pattern',
      default: ['test/**/*.spec.js'],
      type: 'array',
    },
    'mocha.require': {
      description: 'Require path',
      default: [],
      type: 'array',
    },
  },
  command: ['*', 'test [options]'],
  desc: 'Run tests in node',
  builder(yargs) {
    return yargs
      .usage('test [options]')
      .options(command.options)
      .config('config', (configPath) => {
        let foundConfigPath = configPath;
        if (!fs.existsSync(configPath)) {
          foundConfigPath = findUp.sync(command.options.config.default);
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
          process.env.NODE_ENV = 'test';
          opt.require.push('babel-register');
          opt.sourceMap = false;
          opt.instrumenter = './lib/instrumenters/noop';
        }
        return opt;
      });
  },
  handler(argv) {
    const files = utils.getFiles(argv.mocha.glob);
    if (!files.length) {
      console.log('No files found for:', argv.mocha.glob);
      process.exit(0);
    }
    runTests(files, argv);
    if (argv.watch) {
      chokidar.watch(files).on('change', () => {
        runTests(files, argv);
      });
    }
  },
};

module.exports = command;
