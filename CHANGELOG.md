# Changelog

## 3.1.3
- Fix for using correct exit code then running in browser
- Runing mocha with '--exit'

## 3.1.2
- Fix for always sending runner-end 

## 3.1.1
- Fix for creating coverage or phantomjs singleRun before shutting down

## 3.1.0
- Adding possibility to get code coverage for browser tests

## 3.0.2
- Adding possibility to use several grep pattern for aw-webdriver-test-runner

## 3.0.1
- Removing bin that didn't resolve to script

## 3.0.0
- Breaking: removal of contract test runner
- Breaking: update of sinon.js from 1.7.x to 3.x with deprecated methods
- Breaking: removal of aw-test-coverage runner (use aw-test-runner cover instead)
- Using nyc for test coverage

## 2.2.0
- Minimize the console output then running unit tests headless

## 2.1.0
- Adding possibility to log selenium-grid info

## 2.0.0
- Breaking: Removing Protractor and phantomjs-prebuilt as dependencies  
(Should be installed separately if needed)

## 1.0.1
- Randomized report name (for parallel execution)
- Aggregate more than on test in a unique HTML report

## 1.0.0
- Initial public release.
