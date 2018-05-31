const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const util = require('util');
const Highlight = require('highlight.js');

Highlight.configure({
  tabReplace: '    ',
  useBR: true,
  languages: ['javascript'],
});

const utils = {
  getRepoInfo() {
    const packageJSON = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), { encoding: 'utf8' }));
    const repoInfo = {};

    repoInfo.name = packageJSON.name || 'No repository name found (please add to package.json)';
    repoInfo.description = packageJSON.description || 'No repository description found (please add to package.json)';
    repoInfo.version = packageJSON.version || 'No repository version found (please add to package.json)';

    return repoInfo;
  },
  cleanCode(str) {
    // eslint-disable-next-line no-param-reassign
    str = str
      .replace(/\r\n?|[\n\u2028\u2029]/g, '\n')
      .replace(/^\uFEFF/, '')
      .replace(/^function *\(.*\) *{|\(.*\) *=> *{?/, '')
      .replace(/\s+\}$/, '');

    const spaces = str.match(/^\n?( *)/)[1].length;
    const tabs = str.match(/^\n?(\t*)/)[1].length;
    const re = new RegExp(`^\n?${tabs ? '\t' : ' '}{${tabs || spaces}}`, 'gm');

    str = str.replace(re, ''); // eslint-disable-line no-param-reassign
    str = str.replace(/^\s+|\s+$/g, ''); // eslint-disable-line no-param-reassign
    return str;
  },
  errorJSON(err) {
    const res = {};
    Object.getOwnPropertyNames(err).forEach((key) => {
      res[key] = err[key];
    }, err);

    if (res && res.stack) {
      res.stack = Highlight.fixMarkup(Highlight.highlightAuto(res.stack).value);
    }

    return res;
  },
  cleanTest(test) {
    let code;
    let body;

    if (test.fn) {
      code = this.cleanCode(test.fn.toString());
      code = Highlight.fixMarkup(Highlight.highlightAuto(code).value);
    }

    if (test.body) {
      body = this.cleanCode(test.body);
      body = Highlight.fixMarkup(Highlight.highlightAuto(body).value);
    }

    return {
      title: test.title,
      fullTitle: test.fullTitle(),
      state: test.state || 'skipped',
      passed: test.state === 'passed',
      failed: test.state === 'failed',
      pending: test.pending,
      code: code || body,
      timedOut: test.timedOut,
      duration: test.duration,
      file: test.file,
      screenshot: test.screenshot || '',
      err: this.errorJSON(test.err || {}),
      consoleEntries: test.consoleEntries || [],
    };
  },
  createArtifactsFolder(browser) {
    mkdirp.sync(path.resolve(browser.artifactsPath));
  },
  safeFileName(title) {
    return title.replace(/[^a-z0-9().]/gi, '_').toLowerCase();
  },
  screenshotName(title, browserName, startTime) {
    const safeFileName = this.safeFileName(title);
    return util.format('%s-%s-%s.png', safeFileName, browserName, startTime);
  },
  saveScreenshot(browser, title) {
    const screenshot = path.resolve(browser.artifactsPath, 'screenshots', this.screenshotName(title, browser.reporterInfo.browserName, browser.reporterInfo.startTime));

    mkdirp.sync(path.resolve(browser.artifactsPath, 'screenshots'));

    return browser.takeScreenshot().then((png) => {
      fs.writeFileSync(screenshot, png, { encoding: 'base64' });
    });
  },
};

module.exports = utils;
