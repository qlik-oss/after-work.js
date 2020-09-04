/* Acknowledgements:
 This reporter is highly influenced by mochawesome (http://adamgruber.github.io/mochawesome) but
 with some modifications to suite our reporting format.

 For a more generic reporter checkout the work of Adam Gruber (https://github.com/adamgruber)
 */
const mocha = require("mocha");
const fs = require("fs");
const path = require("path");
const utils = require("./utils");
const report = require("./create-static");
const aggregate = require("./aggregate");

const { Base } = mocha.reporters;

const reporter = {
  /**
   * Sets up plugins before tests are run. This is called after the WebDriver
   * session has been started, but before the test framework has been set up.
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before continuing.  If the promise is
   *     rejected, a failed assertion is added to the test results.
   */
  async setup() {
    const config = await browser.getProcessedConfig();
    config.__waitForPromises = [];
  },
  /**
   * This is called after the tests have been run, but before the WebDriver
   * session has been terminated.
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before continuing.  If the promise is
   *     rejected, a failed assertion is added to the test results.
   */
  async teardown() {
    const config = await browser.getProcessedConfig();
    return Promise.all(config.__waitForPromises);
  },

  /**
   * Called after the test results have been finalized and any jobs have been
   * updated (if applicable).
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, it is outputted to the console
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before continuing.  If the promise is
   *     rejected, an error is logged to the console.
   */
  // postResults() {},

  /**
   * Called after each test block (in Jasmine, this means an `it` block)
   * completes.
   *
   * @param {boolean} passed True if the test passed.
   * @param {Object} testInfo information about the test which just ran.
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before outputting test results.  Protractor
   *     will *not* wait before executing the next test, however.  If the promise
   *     is rejected, a failed assertion is added to the test results.
   */
  // postTest( passed, testInfo ) { console.log( passed, testInfo ); },

  /**
   * This is called inside browser.get() directly after the page loads, and before
   * angular bootstraps.
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before continuing.  If the promise is
   *     rejected, a failed assertion is added to the test results.
   */
  // onPageLoad() {},

  /**
   * This is called inside browser.get() directly after angular is done
   * bootstrapping/synchronizing.  If browser.ignoreSynchronization is true, this
   * will not be called.
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before continuing.  If the promise is
   *     rejected, a failed assertion is added to the test results.
   */
  // onPageStable() {},

  /**
   * Between every webdriver action, Protractor calls browser.waitForAngular() to
   * make sure that Angular has no outstanding $http or $timeout calls.
   * You can use waitForPromise() to have Protractor additionally wait for your
   * custom promise to be resolved inside of browser.waitForAngular().
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise=} Can return a promise, in which case protractor will wait
   *     for the promise to resolve before continuing.  If the promise is
   *     rejected, a failed assertion is added to the test results, and protractor
   *     will continue onto the next command.  If nothing is returned or something
   *     other than a promise is returned, protractor will continue onto the next
   *     command.
   */
  // waitForPromise() {},

  /**
   * Between every webdriver action, Protractor calls browser.waitForAngular() to
   * make sure that Angular has no outstanding $http or $timeout calls.
   * You can use waitForCondition() to have Protractor additionally wait for your
   * custom condition to be truthy.
   *
   * @this {Object} bound to module.exports
   *
   * @throws {*} If this function throws an error, a failed assertion is added to
   *     the test results.
   *
   * @return {q.Promise<boolean>|boolean} If truthy, Protractor will continue onto
   *     the next command.  If falsy, webdriver will continuously re-run this
   *     function until it is truthy.  If a rejected promise is returned, a failed
   *     assertion is added to the test results, and protractor will continue onto
   *     the next command.
   */
  // waitForCondition() {},

  /**
   * Used when reporting results.
   *
   * If you do not specify this property, it will be filled in with something
   * reasonable (e.g. the plugin's path)
   *
   * @type {string}
   */
  name: "reporter",
};

function uiReport(runner, options) {
  const { reporterOptions } = options;
  const tests = [];
  let pending = 0;
  let failures = 0;
  let passes = 0;
  let config;

  Base.call(this, runner);
  (async () => {
    config = await browser.getProcessedConfig();
  })();
  if (reporterOptions) {
    if (reporterOptions.xunit) {
      reporterOptions.output = path.resolve(
        browser.reporterInfo.artifactsPath,
        `${browser.reporterInfo.reportName}.xml`
      );
      new mocha.reporters.XUnit(runner, options);
    }
  }
  runner.on("pass", (test) => {
    console.log(
      "\u001b[32m √ PASSED: %s ( %sms )\u001b[0m",
      test.fullTitle(),
      test.duration
    );
    tests.push(test);
    passes++;
  });

  runner.on("pending", (test) => {
    tests.push(test);
    pending++;
  });

  runner.on("fail", (test, err) => {
    try {
      err.expected = JSON.parse(err.expected);
    } catch (e) {
      // Empty catch
    }
    test.consoleEntries = [];
    if (Array.isArray(config.__waitForPromises)) {
      config.__waitForPromises.push(
        utils.saveScreenshot(browser, test.fullTitle())
      );
    }

    console.log(
      "\u001b[31m X FAILED: %s ( %sms )\u001b[0m\n" +
        "\u001b[33m     %s\u001b[0m\n" +
        "\u001b[34m     %s\u001b[0m",
      test.fullTitle(),
      test.duration,
      err.message,
      test.file
    );

    if (browser.reporterInfo.browserName === "chrome") {
      browser
        .manage()
        .logs()
        .get("browser")
        .then((browserLog) => {
          if (browserLog && browserLog.length) {
            console.log(
              "\u001b[91m     %s\u001b[0m",
              "Errors reported in the chrome console - see log for more information"
            );
            browserLog.forEach((log) => {
              if (log.level.value_ >= 1000) {
                test.consoleEntries.push(log.message);
              }
            });
          }
        });
    }

    test.screenshot = `screenshots/${utils.screenshotName(
      test.fullTitle(),
      browser.reporterInfo.browserName,
      browser.reporterInfo.startTime
    )}`;
    tests.push(test);
    failures++;
  });

  runner.once("end", function onEnd() {
    const repoInfo = utils.getRepoInfo(reporterOptions);
    const cleanTests = tests.map(utils.cleanTest.bind(utils));

    const obj = {
      tests: cleanTests,
      stats: {
        suites: this.stats.suites,
        tests: cleanTests.length,
        passes,
        pending,
        failures,
        start: this.stats.start,
        mainStart: browser.reporterInfo.mainStart,
        end: this.stats.end,
        duration: this.stats.duration,
        browserName: browser.reporterInfo.browserName,
        browserVersion: browser.reporterInfo.browserVersion,
        platform: browser.reporterInfo.platform,
        name: repoInfo.name,
        description: repoInfo.description,
        version: repoInfo.version,
      },
    };

    runner.testResults = obj;

    console.log(
      "\u001b[35m Σ SUMMARY: %s testcases runned. \u001b[32m%s passed, \u001b[36m%s pending, \u001b[31m%s failed\u001b[0m",
      obj.stats.tests,
      obj.stats.passes,
      obj.stats.pending,
      obj.stats.failures
    );

    const fileName = path.resolve(
      browser.reporterInfo.artifactsPath,
      `${browser.reporterInfo.reportName}.json`
    );
    utils.createArtifactsFolder(browser.reporterInfo.artifactsPath);
    fs.writeFileSync(fileName, JSON.stringify(obj, null, "\t"));
    if (reporterOptions.html !== false) {
      report.generate(fileName);
    }
  });
}

module.exports = {
  uiReport,
  reporter,
  aggregate,
};
