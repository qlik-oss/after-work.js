# Changelog

## 4.3.1
- Fix: lazy require `server`

## 4.3.0
- Adding the possibility to force its own process to exit once it was finished executing all tests (Node context)

## 4.2.1
- Second fix for JSON parse while creating report

## 4.2.0
- Updated dependencies
- Fix JSON parse for reporting

## 4.1.0
- cdp(connect): fix source-map-support

## 4.0.1
- Ensure normalizing require paths else it will break on windows
- fix(protractor): extend config with argv

## 4.0.0
- CLI with subcommand for running in different contexts
- Better debugging experience
- Easier configuration using config files

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
