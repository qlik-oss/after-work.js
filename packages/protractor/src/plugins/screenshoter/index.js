/* global browser */
const utils = require('./utils');

global.chai.Assertion.addMethod('matchImageOf', utils.matchImageOf);

const screenshoter = {
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
  setup() {
    browser.takeImageOf = utils.takeImageOf.bind(utils, browser);
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
  // teardown() {},

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
  name: 'screenshoter',

};

module.exports = screenshoter;
