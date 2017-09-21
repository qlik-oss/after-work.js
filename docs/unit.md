# Unit test
When running unit tests you should isolate your code so much that it could run in a controlled environment and asserted whether it behaves exactly as you expect.

## CLI commands
A set of CLI commands are included in after-work.js to execute different test runners and tools.

### aw-test-runner (node.js)
`aw-test-runner` is the default test runner for running unit tests with **Mocha** (using node.js). Appending the argument **cover** will trigger nyc to
instrument the code before running the tests and make it possible to get test coverage.
```
aw-test-runner [cover] ./test/unit
```

##### Arguments
  * `cover`: This will instrument the code and report the test coverage
  * `-w`: Watch files for changes which triggers a re-run. (coverage will only be reported after finished test run)
  * `--opts <file>`: path for mocha options file
  * `--debug`: The script will 'break' on the very first line. Use the url chrome://inspect to attach to the debug session. It will also show the exact command that will be executed with all arguments

#### Usage recommendations for Nyc together with babel
If you are using babel as transpiler it's recommended to [set up the project](https://github.com/istanbuljs/nyc#use-with-babel-plugin-istanbul-for-babel-support) with the `babel-plugin-istanbul` and the `cross-env` npm modules.

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

package.json
```
"scripts": {
  "test": "cross-env NODE_ENV=test aw-test-runner <tests>"
}
```

#### Default Arguments added by after-work.js
For convenience the runner will append some default arguments:

**Default:**
  * Mocha:
    * --compilers js:babel-core/register
    * --opts dist/config/mocha.opts  (= recursive)
    * --require dist/config/global.js

**Cover:**
  * Nyc:
    * --source-map false (if `babel-plugin-istanbul` is used)
    * --instrument false (if `babel-plugin-istanbul` is used)
    * --reporter=text
    * --reporter=lcov
    * --all
    * --include src
    * --require babel-register
  * Mocha:
    * --opts dist/config/mocha.opts (= recursive)
    * --require dist/config/global.js

#### Override nyc options
If you want to adjust the arguments for [nyc](https://github.com/istanbuljs/nyc#configuring-nyc) it's recommended to either create a
.nycrc or add a 'nyc object' in package.json.

#### Override mocha options
And for adjusting the [mocha](https://mochajs.org/#mochaopts) arguments either create the file /test/mocha.opts or use the --opts <file> argument to aw-test-runner

### aw-browser-test-runner (browser)
`aw-browser-test-runner` runs the unit tests inside a browser.
```
aw-browser-test-runner ./test/unit
```

##### Arguments
  * `spec`: Paths to spec files (glob pattern).
  * `-s`|`--start-path`: Path to start path.
  * `-p`|`--phantomjs`: Run in PhantomJS.
  * `--requirejs`: Path to RequireJS.
  * `--requirejs-main`: Path to RequireJS main.
  * `--requirejs-start-path`: Path to RequireJS start path.
  * `--systemjs-start-path`: Path to SystemJS start path.
  * `--systemjs`: Run test files in an `systemjs` with babel as transpiler environment.
  * `-d`|`--dirs`: Paths to directories to serve.
  * `--phantomjs-single-run`: Run once.

#### Debugging Browser context
By default, this driver will run the tests inside Chrome. You can bring up **Chrome DevTools**, set the break points, and re-run the tests after you have run the tests once.
