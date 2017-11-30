![after-work.js](aw.png)

[![CircleCI](https://circleci.com/gh/qlik-oss/after-work.js.svg?style=shield)](https://circleci.com/gh/qlik-oss/after-work.js)
[![Greenkeeper badge](https://badges.greenkeeper.io/qlik-oss/after-work.js.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/qlik-oss/after-work.js/master.svg)](https://coveralls.io/github/qlik-oss/after-work.js)

After.work.js is an unified test framework highly configurable through cli and configuration files allowing tests to be executed in the desired context.

## Requirements
### Runner
* Node > 8
### Context dependent
* Chrome > 61
* Protractor
* Puppeteer (experimental)

## Introduction
`after-work.js` aims to be a tool that facilitates the testing while development or restructuring code.
Designed for test and provide fast feedback on changed code and added testcases.

To configure `after-work.js` you need to start with an analyse of the code.
* What context should it be executed in (Node.js, browser)
* What type of tests should be executed (unit, component, integration, e2e)
* Does the code have any dependencies to build or run (babel...)

## Get started

### 1. Installation
Install the module using npm:
```sh
npm install --save-dev after-work.js
```

### 2. CLI entrypoint
`after-work.js` is CLI and consists of a command together with appropriate options
Help is always available with the `--help, -h` option
```
aw <command>

Commands:
  cli.js node        Run tests in node                                                     [default]
  cli.js protractor  Run protractor                                                  [aliases: ptor]
  cli.js cdp         Run tests with cdp (chrome devtools protocol)                 [aliases: chrome]
  cli.js serve       Serve files
  cli.js puppeteer   Run tests with puppeteer                                      [aliases: puppet]

Options:
  --version            Show version number                                                 [boolean]
  --config, -c         Path to JSON config file                             [string] [default: null]
  --glob               Glob pattern                         [array] [default: ["test/**/*.spec.js"]]
  --src                Glob pattern for all source files          [array] [default: ["src/**/*.js"]]
  --require            Require path                                            [array] [default: []]
  --watch, -w          Watch changes                                      [boolean] [default: false]
  --watchGlob, --wg    Watch glob             [array] [default: ["src/**/*.js","test/**/*.spec.js"]]
  --coverage           Generate coverage                                  [boolean] [default: false]
  --mocha.reporter     Which reporter to use                                                [string]
  --mocha.bail         Bail on fail?                                       [boolean] [default: true]
  --mocha.timeout      Timeout                                                              [number]
  --nyc.require        Require path                                            [array] [default: []]
  --nyc.include        Include glob                                            [array] [default: []]
  --nyc.exclude        Exclude glob                            [array] [default: ["**/coverage/**"]]
  --nyc.sourceMap      Should nyc detect and handle source maps?          [boolean] [default: false]
  --nyc.babel          Sets up a preferred babel test environment
                       e.g add `babel-register` to `nyc.require`
                       `nyc.sourceMap=false`
                       `nyc.instrument=./lib/instrumenters/noop`           [boolean] [default: true]
  --nyc.tempDirectory  Directory to output raw coverage information to
                                                        [string] [default: "./coverage/.nyc_output"]
  --nyc.reporter       Coverage reporter(s) to use        [array] [default: ["lcov","text-summary"]]
  --nyc.reportDir      Directory to output coverage reports in        [string] [default: "coverage"]
  -h, --help           Show help                                                           [boolean]
```

## Included Tools
The following tools are bundled into after-work.js:
* **Mocha**: an extensible testing framework for TDD or BDD.
* **Chai**: an assertion library used together with a JavaScript testing framework.
* **Sinon**: a framework for standalone test spies, stubs and mocks for JavaScript.
* **Nyc**: the Istanbul command line interface

### Best practice for coverage
`after-work.js` will default to use babel and babel-plugin-istanbul for getting correct code coverage but these devDependecies has to be installed per repository. 

See [set up the project](https://github.com/istanbuljs/nyc#use-with-babel-plugin-istanbul-for-babel-support) with the `babel-plugin-istanbul`

.babelrc
```
{
  "babel": {
    "presets": ["env"],
    "env": {
      "test": {
        "plugins": ["istanbul"]
      }
    }
  }
}
```

## Examples
* [**Node**](./examples/node/README.md)

Browser
* [**Es2015**](./examples/es2015/README.md)
* [**Requirejs**](./examples/requirejs/README.md)
* [**Typescript**](./examples/typescript/README.md)

## Contributing

Please follow the instructions in [CONTRIBUTING.md](.github/CONTRIBUTING.md).
