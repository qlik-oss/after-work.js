/* eslint no-unused-expressions:0, prefer-destructuring: 0, no-console: 0, import/no-dynamic-require: 0, quote-props: 0, max-len: 0, global-require: 0 */
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const globby = require('globby');
const extend = require('extend');
const { create } = require('browser-sync');
const NYC = require('nyc');
const disableCache = require('./disable-cache');


const coverageConfig = {
  logLevel: 'silent',
  open: false,
  notify: false,
  port: 9677,
  ui: false,
  server: {
    baseDir: ['./coverage/lcov-report'],
  },
};

const utils = {
  getRunnerConfig(cmd, argv, files, instrumenter) {
    const baseDir = this.getBrowserDefaultPaths(cmd);
    const requirejsDir = this.relativeToCwd(path.dirname(argv.path));
    const requirejsMainDir = this.relativeToCwd(path.dirname(argv.main));
    argv.coverageConfig.blackList.push(...[path.basename(argv.main), path.basename(argv.path)]);
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
    const bsConfig = {
      logLevel: argv.logLevel,
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
    return bsConfig;
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
      tempDirectory: './coverage/.nyc_output',
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
          if (!argv.singleRun) {
            coverage.runner.reload();
          }
        }
        if (argv.singleRun) {
          runner.exit();
          coverage.runner.exit();
          process.exit(stats.failures.length);
        }
      });
      client.on('window-error', () => {
        runner.exit();
        coverage.runner.exit();
        process.exit(1);
      });
    });
    resolve(local);
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
  addArg(arr, arg, val) {
    if (arg === '--recursive' || arg === '--watch') {
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
  runPhantom(url, singleRun) {
    const phantomFile = this.relativeToCwd(path.resolve(__dirname, 'phantomjs-runner.js'));
    let phantomBin;
    try {
      phantomBin = require.resolve('phantomjs-prebuilt/bin/phantomjs');
    } catch (_) {
      try {
        phantomBin = require.resolve(`${path.resolve(process.cwd())}/node_modules/phantomjs-prebuilt/bin/phantomjs`);
      } catch (__) {
        if (__.message.indexOf('phantomjs-prebuilt/bin/phantomjs') !== -1) {
          console.log('phantomjs-prebuilt could not be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json');
        } else {
          console.log(__);
        }
        process.exit(1);
      }
    }
    const proc = cp.fork(phantomBin, [phantomFile, '--pageUrl', url, '--single-run', singleRun], {
      env: process.env,
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    process.on('exit', () => {
      proc.kill();
    });
  },
};

module.exports = utils;
