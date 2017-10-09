/* eslint no-unused-expressions:0, prefer-destructuring: 0, no-console: 0, import/no-dynamic-require: 0, quote-props: 0, max-len: 0, global-require: 0 */
const path = require('path');
const fs = require('fs');
// const findUp = require('find-up');
const globby = require('globby');
const extend = require('extend');
const { create } = require('browser-sync');
const NYC = require('nyc');
const disableCache = require('./disable-cache');

const globalMochaRequire = path.resolve(__dirname, './config/global.js');

const defaultConfig = {
  cover: {
    nyc: {
      // require: 'babel-register',
      all: true,
      include: 'src',
      reporter: ['text', 'lcov', 'text-summary'],
      'temp-directory': './coverage/.nyc_output',
    },
    mocha: {
      // recursive: true,
      // compilers: 'js:babel-core/register',
    },
  },
  mocha: {
    // recursive: true,
    // compilers: 'js:babel-core/register',
  },
  requirejs: {
    glob: undefined,
    path: undefined,
    main: undefined,
    coverage: false,
    coverageConfig: {
      blackList: ['require.js', 'mocha.js', 'chai.js', 'sinon.js', 'setup.js'],
    },
  },
  webdriver: {
  },
};

const coverageConfig = {
  open: false,
  notify: false,
  port: 9677,
  ui: false,
  server: {
    baseDir: ['./coverage/lcov-report'],
  },
};

const utils = {
  globalMochaRequire,
  config: defaultConfig,
  getRunnerConfig(cmd, argv, files, instrumenter) {
    const baseDir = this.getBrowserDefaultPaths(cmd);
    const requirejsDir = this.relativeToCwd(path.dirname(argv.path));
    const requirejsMainDir = this.relativeToCwd(path.dirname(argv.main));
    console.log(argv);
    baseDir.push(requirejsDir, requirejsMainDir);
    const middleware = [disableCache];
    if (argv.coverage) {
      middleware.push((req, res, next) => {
        const url = req.url.substring(1);
        const isTestFile = files.indexOf(url) !== -1;
        // console.log(isTestFile, url);
        if (!isTestFile && url.indexOf('.js', url.length - 3) !== -1 &&
          argv.coverageConfig.blackList.filter(f => url.indexOf(f) !== -1).length === 0) {
          const filePath = path.relative(process.cwd(), url);
          const file = fs.readFileSync(filePath, 'utf-8');
          // console.log('Instrumenting ', url);
          res.end(instrumenter.instrumentSync(file, filePath));
        } else {
          next();
        }
      });
    }
    const startPath = 'index.html';
    const rewriteRules = [{
      match: /%insert-files%/g,
      fn: () => this.getScriptFiles(files),
    }, {
      match: /%insert-requirejs%/g,
      fn: () => {
        let insert = '';
        insert += `<script>var files = [${files.map(f => `'${f}'`).join(',')}];</script>`;
        insert += `<script data-main='/${argv.main.split('\\').pop().split('/').pop()}' src='/${argv.path.split('\\').pop().split('/').pop()}'></script>\n`;
        return insert;
      },
    }];
    const config = {
      port: argv.port,
      open: argv.open,
      notify: false,
      ui: false,
      startPath,
      rewriteRules,
      server: {
        baseDir,
        directory: true,
        middleware,
      },
    };
    return config;
  },
  initRunner(cmd, argv, files, coverage, resolve, reject) {
    const runner = this.createRunner('test-runner');
    runner.pause();
    const bsConfig = this.getRunnerConfig(cmd, argv, files, coverage.nyc.instrumenter());
    runner.init(bsConfig, this.onRunnerInit.bind(this, runner, argv, coverage, resolve, reject));
  },
  onCoverageRunnerInit(resolve, reject) {
    const nyc = new NYC(extend({
      reporter: ['text', 'lcov', 'text-summary'],
      'temp-directory': './coverage/.nyc_output',
    }));
    const runner = this.createRunner('coverage-runner');
    runner.pause();
    runner.init(coverageConfig, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({ runner, nyc });
      }
    });
  },
  onRunnerInit(runner, argv, coverage, resolve, reject, err, bs) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    const local = bs.options.get('urls').get('local');
    runner.sockets.on('connection', (client) => {
      console.log('Connected on', local);
      client.on('runner-start', () => {
        console.log('Runner start');
        coverage.nyc.reset();
      });
      client.on('runner-end', (o) => {
        console.log('Runner ended');
        const { stats, coverageObj } = o;
        if (coverageObj) {
          global.__coverage__ = coverageObj; //eslint-disable-line
          coverage.nyc.writeCoverageFile();
          coverage.nyc.report();
          coverage.runner.reload();
        }
        if (argv.singleRun) {
          runner.exit();
          coverage.runner.exit();
          process.exit(stats.failures.length);
        }
      });
      client.on('window-error', () => {
        runner.exit();
      });
    });
    resolve();
  },
  createRunner(id) {
    return create(id);
  },
  getScriptFiles(files) {
    return files.map(f => `<script src='${f}'></script>`).join('\n');
  },
  relativeToCwd(p) {
    return path.relative(process.cwd(), path.resolve(p));
  },
  getBrowserDefaultPaths(prefix) {
    return [
      './',
      this.relativeToCwd(path.resolve(__dirname, 'browser', prefix)),
      this.relativeToCwd(path.dirname(require.resolve('mocha'))),
      this.relativeToCwd(path.dirname(require.resolve('chai'))),
    ];
  },
  getConfig(cmd, configPath, additionalConfig) {
    const config = require(path.relative(__dirname, path.resolve(configPath)));
    if (typeof config === 'function') {
      return extend(defaultConfig[cmd], config(additionalConfig || defaultConfig[cmd]));
    }
    return extend(additionalConfig || defaultConfig[cmd], config);
  },
  addArg(arr, arg, val) {
    if (arg === '--recursive') {
      if (val) {
        arr.push(arg);
      }
      return;
    }
    arr.push(arg);
    arr.push(val);
  },
  addKeys(cfg, keys, prefix) {
    const arr = [];
    keys.forEach((key) => {
      const arg = `--${key}`;
      const val = cfg[prefix][key];
      if (Array.isArray(val)) {
        val.forEach((v) => {
          this.addArg(arr, arg, v);
        });
      } else {
        this.addArg(arr, arg, val);
      }
    });
    return arr;
  },
  getArgs(argv, prefix) {
    const keys = Object.keys(argv[prefix] || {});
    const args = this.addKeys(argv, keys, prefix);
    return args;
  },
  getFiles(args) {
    return globby.sync(args);
  },
};

module.exports = utils;
