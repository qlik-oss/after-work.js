![after-work.js](aw.png)

[![CircleCI](https://circleci.com/gh/qlik-oss/after-work.js.svg?style=shield)](https://circleci.com/gh/qlik-oss/after-work.js)
[![Greenkeeper badge](https://badges.greenkeeper.io/qlik-oss/after-work.js.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/qlik-oss/after-work.js/master.svg)](https://coveralls.io/github/qlik-oss/after-work.js)

After.work.js is an unified test framework highly configurable through cli and configuration files allowing tests to be executed in the desired context.

## Requirements
### Default runner
* [node](https://nodejs.org): Node.js > 8
### Context dependent
* [cdp](./docs/cdp.md#cdp) (Chrome Debugging Protocol): Chrome > 61
* [protractor](./docs/protractor.md#protractor-config) (webdriver protocol): protractor 5.x + browser(s)
* [puppeteer](https://github.com/GoogleChrome/puppeteer) (Headless Chrome Node API - experimental): puppeteer

## Introduction
`after-work.js` aims to be a tool that facilitates the testing while development or restructuring code.
Designed for test and provide fast feedback on changed code and added testcases.

To configure `after-work.js` you need to start with an analyse of the code.
* What context should it be executed in (Node.js, browser)
* What type of tests should be executed (unit, component, integration, e2e)
* Does the code have any dependencies to build or run (babel...)

## Get started

### Installation
Install the module using npm:
```sh
npm install --save-dev after-work.js
```

### CLI entrypoint
`after-work.js` is CLI and consists of a command together with appropriate options
Help is always available with the `--help, -h` option
```
aw <command>

Commands:
  aw node        Run tests in node                                                         [default]
  aw protractor  Run protractor                                                      [aliases: ptor]
  aw cdp         Run tests with cdp (chrome devtools protocol)                     [aliases: chrome]
  aw serve       Serve files
  aw puppeteer   Run tests with puppeteer                                          [aliases: puppet]
```

## Included Tools
The following tools are bundled into after-work.js:
* [Mocha](https://mochajs.org/): an extensible testing framework for TDD or BDD.
* [Chai](http://chaijs.com/): an assertion library used together with a JavaScript testing framework.
* [Sinon](http://sinonjs.org/): a framework for standalone test spies, stubs and mocks for JavaScript.
* [Nyc](https://istanbul.js.org/): the Istanbul command line interface

## Examples
* [**Node**](./examples/node/README.md)

Browser
* [**Es2015**](./examples/es2015/README.md)
* [**Requirejs**](./examples/requirejs/README.md)
* [**Typescript**](./examples/typescript/README.md)

## Contributing

Please follow the instructions in [CONTRIBUTING.md](.github/CONTRIBUTING.md).
