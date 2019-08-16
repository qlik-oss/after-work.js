const path = require('path');
const chokidar = require('chokidar');
const globby = require('globby');
const utils = require('@after-work.js/utils');

const onWatchAdd = (runner, f) => {
  if (utils.isMatchingExtPattern(f, runner.argv.testExt)) {
    runner.testFiles.push(f);
  } else if (utils.isMatchingExtPattern(f, runner.argv.srcExt)) {
    runner.srcFiles.push(f);
  }
};

const onWatchUnlink = (runner, f) => {
  const tIx = runner.testFiles.indexOf(f);
  const sIx = runner.srcFiles.indexOf(f);
  if (tIx !== -1) {
    runner.testFiles.splice(tIx, 1);
  }
  if (sIx !== -1) {
    runner.srcFiles.splice(sIx, 1);
  }
  runner.safeDeleteCache(f);
};

const onWatch = (runner, f) => {
  if (runner.isRunning) {
    return;
  }
  const isTestFile = runner.testFiles.indexOf(f) !== -1;
  const isSrcFile = runner.srcFiles.indexOf(f) !== -1;
  if (isTestFile) {
    const srcFiles = runner.getSrcFilesFromTestFiles([f]);
    runner.setupAndRunTests([f], srcFiles);
  } else if (isSrcFile) {
    const testFiles = runner.getTestFilesFromSrcFiles([f]);
    runner.setupAndRunTests(testFiles, [f]);
  } else {
    runner.run();
  }
};

module.exports = runner => {
  const paths = globby.sync(runner.argv.watchGlob);
  chokidar
    .watch(paths, {
      ignoreInitial: true,
    })
    .on('change', f => onWatch(runner, path.resolve(f)))
    .on('add', f => onWatchAdd(runner, path.resolve(f)))
    .on('unlink', f => onWatchUnlink(runner, path.resolve(f)));
};
