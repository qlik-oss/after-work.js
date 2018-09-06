const fs = require('fs');
const path = require('path');
const { SnapshotState, toMatchSnapshot } = require('jest-snapshot');
const { getTransform } = require('@after-work.js/transform');
const utils = require('@after-work.js/utils');

const getSourceContent = (filename) => {
  const { map } = getTransform(filename) || {};
  if (map) {
    return map.sourcesContent[0];
  }
  return fs.readFileSync(filename, 'utf8');
};

module.exports = function snapshot(runner) {
  return function chaiToMatchSnapshot() {
    const [filename, lineno] = utils.getCurrentFilenameStackInfo(runner.testFiles);
    const src = getSourceContent(filename);
    const lines = src.split('\n');

    let currentTestName = null;
    for (let i = lineno - 1; i >= 0; i -= 1) {
      const line = lines[i];
      if (line.trimLeft().startsWith('it')) {
        [, currentTestName] = line.match(/it.*\((.*),/);
        break;
      }
    }
    if (currentTestName === null) {
      throw new Error('Can not find current test name');
    }

    let snapshotState = runner.snapshotStates.get(filename);
    if (!snapshotState) {
      const snapshotPath = `${path.join(
        path.join(path.dirname(filename), '__snapshots__'),
        `${path.join(path.basename(filename))}.snap`,
      )}`;
      snapshotState = new SnapshotState(currentTestName, {
        updateSnapshot: runner.argv.updateSnapshot ? 'all' : 'new',
        snapshotPath,
      });
      runner.snapshotStates.set(filename, snapshotState);
    }
    const matcher = toMatchSnapshot.bind({
      snapshotState,
      currentTestName,
    });
    const result = matcher(this._obj);
    snapshotState.save();
    this.assert(
      result.pass,
      result.message,
      result.message,
      result.expected,
      result.actual,
    );
  };
};
