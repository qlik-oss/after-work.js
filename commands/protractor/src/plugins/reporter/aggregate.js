/**
 * Created by BEZ on 15/02/2017.
 */
const path = require('path');
const fs = require('fs');
const report = require('./create-static');

function reduceTestObject(accumulator, currentValue) {
  accumulator.tests = accumulator.tests.concat(currentValue.tests);
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

module.exports = function aggregateReports(reportName, artifactsPath, reports) {
  if (reports.length <= 1) {
    return undefined;
  }
  const sumTests = reports
    .map(r => JSON.parse(fs.readFileSync(r, 'utf8')))
    .reduce(reduceTestObject);

  if (sumTests) {
    console.error(sumTests);
    const fileName = path.resolve(artifactsPath, `${reportName}.json`);
    fs.writeFileSync(fileName, JSON.stringify(sumTests, null, '\t'));
    report.generate(fileName);
  }
  return sumTests;
};
