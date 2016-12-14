# Changelog

## 0.12.16
- Chore: Update protractor to 4.0.11

## 0.12.15
- Feature: Adding chrome consolelog to test html log

## 0.12.14
- Fix: Changing os name to use "-"

## 0.12.1x
- Fix: Downgrading protractor since test agents doesn't support protractor 4.x (requires chrome > 49)

## 0.12.10
- Feature: Enabling xunit reporting
- Chore: Update protractor to 4.0.4

## 0.12.9
- Fix: Republishing with files in bin/ to use LF (else it will cause problems on OsX/Linux)

## 0.12.8
- Fix: Blocking phantomjs-prebuild dependency to 2.1.7 (2.1.8 is breaking the build)

## 0.12.5
- Fix: Not bailing on errors for aw-browser-test-runner

## 0.12.4
- Fix: Resolving dependencies for aw-browser-test-runner

## 0.12.3
- Fix: Running test in phantomjs

## 0.12.2
- Feature: Added extend as dependency
- Fix: Changed paths in configurations

## 0.12.1
- Breaking change: Changed the base URL to use IPaddress instead of hostname (FQDN)

## 0.12.0
- Breaking change: Screenshoter now include platform name in output images
- Breaking change: Removed client configurations

## 0.11.1
- Fix: Contract testing - parent process waits for child process to begin

## 0.11.0
- Feature: Added functionality for contract testing

## 0.10.8
- Fix: Adjusted tolerance for screenshoter to be able to run in saucelabs

## 0.10.7
- Fix: Loading dependency over https instead (http didn't work in circleCI)

## 0.10.6
- Fix: Specifying platform for saucelabs configuration

## 0.10.5
- Feature: Adding configuration for running component tests against saucelabs

## 0.10.4
- Feature: Enabling ES6 browser debug testing

## 0.10.3
- Fix: Updated the conf.dev.js
- Fix: Changed the result log to be able to show "crashed" tests as failed

## 0.10.2
- Fix: Setting correct artifacts path

## 0.10.1
- Fix: Enabling all (three) browsers

## 0.10.0
- Breaking change: Renaming of commands to be called when starting the different tests
- Feature: Using a selenium grid instead of installing selenium locally
- Feature: Upgraded `istanbul`
- Feature: Added browser testing for unit test
- Feature: Increased test coverage

## 0.9.2
- Fix: Now possible to use npm@^3.0.0

## 0.9.1
- Fix: Sending defaultSeleniumConfig into SeleniumStart as well

## 0.9.0
- Remove all code connected to `engine`
- Rename `bin` scripts with new prefix `aw`
- Move non es6 files into `lib`
- Test folder now only contains tests for this repo

## 0.8.4
- Fix for `start-test-coverage`. Make sure to pass `mocha` arguments

## 0.8.3
- Fix for including `test/mocha.opts`

## 0.8.2
- Fix for `start-test-runner` and `start-test-coverage`. Make sure to
  handle different arguments in a better way.

## 0.8.1
- Refactor `start-test-runner` and `start-test-coverage`

## 0.8.0
- Breaking change: renaming of bin files for running unit test
- Breaking change: renaming conf.ci.js -> conf.js
- Breaking change: renaming conf.js -> conf.dev.js

## 0.7.5
- Fix: use relative path for unit test files

## 0.7.4
- Feature: Added possibility to run unit test thru the testing framework

## 0.7.3
- Fix: Refactor to make all the console output appear on jenkins

## 0.7.2
- Fix: Disable gpu acceleration for Firefox

## 0.7.1
- Fix: Disable scroll/translate to center component

## 0.7.0
- Feature: Creation of html report
- Fix: Setting tolerance for screenshots to 0.002

## 0.6.8
- Fix: Change the tolerance for image compare to 0
- Fix: Save screenshots async
- Fix: Sending in version of selenium to selenium standalone start

## 0.6.7

- Fix: Using 'localhost' for desktop

## 0.6.6

- Fix: Using process.env.computername instead of process.env.hostname

## 0.6.5

- Fix: Ignore getCertificates if desktop

## 0.6.4

- Fix: Getting hostname for desktop using process.env
- Fix: Fixing unittests for screenshoter

## 0.6.3

- Fix: Setting test case to skipped then taking new baseline

## 0.6.2

- Fix: Setting fixed version for selenium and drivers
- Fix: Changing console colors to default color range

## 0.6.1

- Feature: Colorful console output and JSON report for CI conf

## 0.6.0

- Feature: Screenshoter fixes for scrollIntoview and possibilities to add configurations

## 0.5.1

- Feature: Adding possibility to take snapshots and use expect to compare

## 0.5.0

- Breaking change: getDefaultConfig has a different return signature

## 0.4.0

- Feature: Changed to use Protractor instead of webdriverIO

## 0.3.1

- Fix: Changed Firefox option to be able to start specified Firefox version
- Fix: Enabling Firefox preferences to use NTLM for login

## 0.3.0

- Feature: Added possibility to enable http
- Feature: Added possibility to upload an app(.qvf)

## 0.2.0

- Feature: Better usage of framework with possibility to add arguments
- Feature: Downloading dependencies like browsers etc (with fixed versions)
- Fix: Small changes for better integration from other repositories

## 0.1.0

- Initial release: Release with webdriverIO, Selenium-standalone, mocha
