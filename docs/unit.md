# Unit test
When running unit tests you should isolate your code so much that it could run in a controlled environment and asserted whether it behaves exactly as you expect.

## CLI commands
A set of CLI commands are included in after-work.js to execute different test runners and tools.

### aw-test-coverage (node.js)
`aw-test-coverage` executes **Istanbul** to instrument the code and run tests to create a report of the current test coverage.
```
aw-test-coverage -- test/unit
```
##### Arguments
  * `-- "folder"`: The starting point to run code coverage upon.
  * `-x "folder"`: Excludes this folder from the code coverage.
  * `--dir "folder"`: Specifies the output folder for the report.

### aw-test-runner (node.js)
`aw-test-runner` is the default test runner for running unit tests with **Mocha** (using node.js).
```
aw-test-runner ./test/unit
```

##### Arguments
  * `-w`: Watch files for changes which triggers a re-run.

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

## Debugging

### Node context
Add the `--debug` argument to the aw-test-runner CLI command. The script will break on the very first line in **Chrome DevTools**.

### Browser context
By default, this driver will run the tests inside Chrome. You can bring up **Chrome DevTools**, set the break points, and re-run the tests after you have run the tests once.
