/**
 * Created by BEZ on 15/02/2017.
 */
const path = require('path');
const fs = require('fs');
const report = require('./create-static');

function reduceTestObject(accumulator, currentValue) {
  accumulator.tests = accumulator.tests.concat(currentValue.tests); // eslint-disable-line no-param-reassign, max-len
  const { stats } = accumulator;
  const currentStats = currentValue.stats;

  stats.suites += currentStats.suites;
  stats.tests += currentStats.tests;
  stats.passes += currentStats.passes;
  stats.pending += currentStats.pending;
  stats.failures += currentStats.failures;
  stats.duration += currentStats.duration;
  stats.start = stats.start < currentStats.start ? stats.start : currentStats.start;
  stats.end = stats.end < currentStats.end ? currentStats.end : stats.end;

  return accumulator;
}

module.exports = function aggregateReports(reportName, artifactsPath) {
  const files = fs.readdirSync(artifactsPath);

  const allTests = files.filter(name => path.extname(name) === '.json')
    .map(name => path.resolve(artifactsPath, name))
    .map(filepath => JSON.parse(fs.readFileSync(filepath, 'utf8')));

  if (allTests.length === 0) {
    return undefined;
  }

  const sumTests = allTests.reduce(reduceTestObject);

  if (sumTests) {
    const fileName = path.resolve(artifactsPath, `${reportName}.json`);

    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, JSON.stringify(sumTests, null, '\t'), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(() => report.generate(fileName));
  }
  return sumTests;
};
