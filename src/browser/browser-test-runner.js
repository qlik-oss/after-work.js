/* eslint camelcase:0, no-process-exit: 0, no-console: 0 */
import path from 'path';
import fs from 'fs';
import util from 'util';
import globby from 'globby';
import Promise from 'bluebird';
import { create } from 'browser-sync';
import child_process from 'child_process';
import program from 'commander';
import NYC from 'nyc';
import disableCache from './disable-cache';

const nyc = new NYC({
  reporter: ['text', 'lcov', 'text-summary'],
});
const instrumenter = nyc.instrumenter();

function srcFiles(files) {
  return files.map(f => `<script src='${f}'></script>`).join('\n');
}

export function relativeFromDirToCwd(p) {
  return path.relative(process.cwd(), path.resolve(__dirname, p));
}

export function relativeToCwd(p) {
  return path.relative(process.cwd(), path.resolve(p));
}

export function getFolder(f) {
  return f.split('\\').pop().split('/').slice(0, -1).join('/'); //eslint-disable-line
}

export function getBrowserSyncConfig(paths, files, options) {
  const {
    dirs, phantomjs, requirejs, requirejsMain, requirejsStartPath,
    systemjs, systemjsStartPath, coverage,
  } = options;
  const startPath = requirejs ? requirejsStartPath : systemjs ? systemjsStartPath : options.startPath; //eslint-disable-line
  const rjs = [];
  if (requirejs) {
    rjs.push(relativeToCwd(getFolder(requirejs)));
  }
  if (requirejsMain) {
    rjs.push(relativeToCwd(getFolder(requirejsMain)));
  }
  return {
    open: !phantomjs,
    notify: false,
    port: 9676,
    ui: false,
    server: {
      baseDir: ['./'].concat(paths).concat(rjs).concat(dirs),
      directory: true,
      middleware: [disableCache, (req, res, next) => {
        if (!coverage) {
          next();
          return;
        }
        const url = req.url.substring(1);
        const isTestFile = files.indexOf(url) !== -1;
        // console.log(isTestFile, url);
        if (!isTestFile && url.indexOf('.js', url.length - 3) !== -1 &&
          url.indexOf('require.js') === -1 &&
          url.indexOf('requirejs-main.js') &&
          url.indexOf('mocha.js') === -1 &&
          url.indexOf('chai.js') === -1 &&
          url.indexOf('browser-test-runner') === -1) {
          const filePath = path.relative(process.cwd(), url);
          const file = fs.readFileSync(filePath, 'utf-8');
          // console.log('Instrumenting ', url);
          res.end(instrumenter.instrumentSync(file, filePath));
        } else {
          next();
        }
      }],
    },
    startPath,
    rewriteRules: [{
      match: /%insert-files%/g,
      fn: () => srcFiles(files),
    }, {
      match: /%insert-requirejs%/g,
      fn: () => {
        let insert = '';
        insert += `<script>var files = [${files.map(f => `'${f}'`).join(',')}];</script>`;
        insert += `<script data-main='${requirejsMain.split('\\').pop().split('/').pop()}' src='/${requirejs.split('\\').pop().split('/').pop()}'></script>\n`;
        return insert;
      },
    }],
  };
}


export function runPhantom(url, singleRun) {
  const phantomFile = relativeFromDirToCwd('../phantomjs-runner.js');
  let phantomBin;

  try {
    phantomBin = require.resolve('phantomjs-prebuilt/bin/phantomjs');
  } catch (e) {
    const missingPhantom = 'Cannot find module "phantomjs-prebuilt/bin/phantomjs"';
    if (e.message === missingPhantom) {
      console.log('phantomjs-prebuilt could not be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json');
    } else {
      console.log(e);
    }
  }

  const proc = child_process.fork(phantomBin, [phantomFile, '--pageUrl', url, '--single-run', singleRun], {
    env: process.env,
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  proc.on('exit', (code) => {
    process.exit(code);
  });

  proc.on('error', () => {
    process.exit(-1);
  });
}

export function run(files, options) {
  const testRunner = create('test-runner');
  const coverageRunner = create('coverage-runner');

  const paths = [
    relativeFromDirToCwd('./'),
    path.dirname(require.resolve('mocha')),
    path.dirname(require.resolve('chai')),
  ];

  if (options.systemjs) {
    paths.push(path.join(path.dirname(require.resolve('systemjs')), 'dist'));
    paths.push(path.dirname(require.resolve('babel-core')));
  }
  testRunner.pause();
  coverageRunner.pause();

  testRunner.watch(files).on('change', (event, file) => {
    testRunner.reload(file);
  });

  let coveragePromise = Promise.resolve();
  if (options.coverage) {
    coveragePromise = new Promise((resolve) => {
      coverageRunner.init({
        open: true,
        notify: false,
        port: 9677,
        ui: false,
        server: options.coverage,
      }, (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
          return;
        }
        resolve();
      });
    });
  }
  return Promise.all([coveragePromise, new Promise((resolve, reject) => {
    testRunner.init(getBrowserSyncConfig(paths, files, options), (err, bs) => {
      if (err) {
        reject(err);
        return;
      }
      const local = bs.options.get('urls').get('local');
      testRunner.sockets.on('connection', (client) => {
        console.log('Connected on', local);
        client.on('runner-end', (o) => {
          console.log('Runner ended');
          const { stats, coverageObj } = o;
          if (coverageObj) {
            global.__coverage__ = coverageObj; //eslint-disable-line
            nyc.writeCoverageFile();
            nyc.report();
            coverageRunner.reload();
          }
          if (options.singleRun) {
            testRunner.exit();
            coverageRunner.exit();
            process.exit(stats.failures.length);
          }
        });
        client.on('runner-log', (args) => {
          console.log(util.format(...args));
        });
        client.on('window-error', () => {
          testRunner.exit();
          coverageRunner.exit();
          process.exit(-1);
        });
      });
      resolve(local);
    });
  })]);
}

export function init(args, options) {
  const files = globby.sync(args);
  if (!files.length) {
    console.log('No files found for:', args);
    process.exit(0);
  }

  run(files, options).then((url) => {
    if (options.phantomjs) {
      runPhantom(url, options.phantomjsSingleRun);
    }
  });
}

export function runProgram() {
  program
    .arguments('<paths>', 'Paths to spec files')
    .option('--coverage [coverage]', 'Generate coverage', false)
    .option('-s, --start-path [path]', 'Path to start page', 'browser-test-runner.html')
    .option('-p, --phantomjs [phantomjs]', 'Run in phantomjs', false)
    .option('--requirejs [path]', 'Path to requirejs', '')
    .option('--requirejs-main [path]', 'Path to requirejs main', '')
    .option('--requirejs-start-path [path]', 'Path to requirejs start path', 'browser-test-runner-requirejs.html')
    .option('--systemjs-start-path [path]', 'Path to systemjs start path', 'browser-test-runner-systemjs.html')
    .option('-d, --dirs [paths]', 'Paths to directories to serve', arg => arg.split(',').map(p => path.relative(process.cwd(), path.resolve(p))), [])
    .option('--phantomjs-single-run [single run]', 'Run once', false)
    .option('--systemjs', 'Run test files in an `systemjs` with babel as transpiler environment', false)
    .parse(process.argv);

  if (!program.args[0]) {
    program.outputHelp();
    process.exit(0);
  }
  init(program.args, program);
}
