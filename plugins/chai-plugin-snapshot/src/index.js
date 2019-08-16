const fs = require('fs');
const {
  SnapshotState,
  toMatchSnapshot,
  buildSnapshotResolver,
} = require('jest-snapshot');
const { getTransform } = require('@after-work.js/transform');
const utils = require('@after-work.js/utils');

const getSourceContent = filename => {
  const { map } = getTransform(filename) || {};
  if (map) {
    return map.sourcesContent[0];
  }
  return fs.readFileSync(filename, 'utf8');
};

module.exports = function snapshot(runner) {
  return function chaiToMatchSnapshot() {
    const [filename, lineno] = utils.getCurrentFilenameStackInfo(
      runner.testFiles,
    );
    const src = getSourceContent(filename);
    const lines = src.split('\n');

    let currentTestName = null;
    for (let i = lineno - 1; i >= 0; i -= 1) {
      const line = lines[i];
      const trimmed = line.trimLeft();
      if (trimmed.startsWith('it(') || trimmed.startsWith('it.only(')) {
        [, currentTestName] = line.match(/it.*\((.*),/);
        break;
      }
    }
    if (currentTestName === null) {
      throw new Error('Can not find current test name');
    }

    let { snapshotState } = runner.snapshotContexts.get(filename) || {};
    if (!snapshotState) {
      const snapshotResolver = buildSnapshotResolver({
        rootDir: process.cwd(),
      });
      const snapshotPath = snapshotResolver.resolveSnapshotPath(filename);
      snapshotState = new SnapshotState(snapshotPath, {
        updateSnapshot: runner.argv.updateSnapshot ? 'all' : 'new',
      });
      runner.snapshotContexts.set(filename, { currentTestName, snapshotState });
    }
    const matcher = toMatchSnapshot.bind({
      snapshotState,
      currentTestName,
    });
    const result = matcher(this._obj);
    this.assert(
      result.pass,
      result.message,
      result.message,
      result.expected,
      result.report,
    );
  };
};
