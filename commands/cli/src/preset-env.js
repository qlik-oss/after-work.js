module.exports = (runner, presetEnv, filter) => {
  if (presetEnv) {
    const sinon = require('sinon');
    const chai = require('chai');
    const sinonChai = require('sinon-chai');
    const chaiAsPromised = require('chai-as-promised');
    const chaiSubset = require('chai-subset');
    const screenshotPlugin = require('@after-work.js/chai-plugin-screenshot');
    const snapshotPlugin = require('@after-work.js/chai-plugin-snapshot');
    global.sinon = sinon;
    global.chai = chai;
    global.expect = chai.expect;
    chai.use(sinonChai);
    chai.use(chaiAsPromised);
    chai.use(chaiSubset);
    chai.Assertion.addMethod('matchImageOf', screenshotPlugin.matchImageOf);
    if (runner) {
      chai.Assertion.addMethod('toMatchSnapshot', snapshotPlugin(runner));
    }
  }
  if (runner.argv.interactive) {
    const interactivePlugin = require('@after-work.js/interactive-plugin');
    interactivePlugin(runner, filter);
  }
};
