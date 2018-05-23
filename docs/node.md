---
id: node
title: Node.js
---

Run your test in a [Node](https://nodejs.org) environment with great developer workflow. Just start the runner with

```
npx aw -c ./path/to/aw.config.js -w --coverage
```

and start testing. It will only rerun affected tests and generate coverage accordingly.
Add files, remove files as you go and change your tests to rapidly build up a test coverage.

## Best practice for coverage
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

```shell
Options:
  --version            Show version number                                                                     [boolean]
  --config, -c         Path to JSON config file                                                 [string] [default: null]
  --glob               Glob pattern                                             [array] [default: ["test/**/*.spec.js"]]
  --src                Glob pattern for all source files                              [array] [default: ["src/**/*.js"]]
  --require            Require path                                                                [array] [default: []]
  --watch, -w          Watch changes                                                          [boolean] [default: false]
  --watchGlob, --wg    Watch glob                                 [array] [default: ["src/**/*.js","test/**/*.spec.js"]]
  --coverage           Generate coverage                                                      [boolean] [default: false]
  --mocha.reporter     Which reporter to use                                                                    [string]
  --mocha.bail         Bail on fail?                                                           [boolean] [default: true]
  --mocha.timeout      Timeout                                                                                  [number]
  --nyc.require        Require path                                                                [array] [default: []]
  --nyc.include        Include glob                                                                [array] [default: []]
  --nyc.exclude        Exclude glob                                                [array] [default: ["**/coverage/**"]]
  --nyc.sourceMap      Should nyc detect and handle source maps?                              [boolean] [default: false]
  --nyc.babel          Sets up a preferred babel test environment
                       e.g add `babel-register` to `nyc.require`
                       `nyc.sourceMap=false`
                       `nyc.instrument=./lib/instrumenters/noop`                               [boolean] [default: true]
  --nyc.tempDirectory  Directory to output raw coverage information to      [string] [default: "./coverage/.nyc_output"]
  --nyc.reporter       Coverage reporter(s) to use                            [array] [default: ["lcov","text-summary"]]
  --nyc.reportDir      Directory to output coverage reports in                            [string] [default: "coverage"]
  -h, --help           Show help                                                                               [boolean]
```
