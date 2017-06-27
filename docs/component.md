# Component test
Component test should test a bigger part of the code than unit test, it should test something that gives value to the user but still limited to a "component". The definition of component is vague but it deliberately neglect parts of the system outside the scope of the test.

To isolate the components we use mocked data that is "injected" into the code or even a fixture to initiate the code to be tested.

If the code is to run inside a browser the fixture is often a html page to bootstrap the code.

## CLI commands
A set of CLI commands are included in after-work.js to execute different test runners and tools.

### aw-web-server
`aw-web-server` starts a web server on port `9000` and hosts the static files from ./test/fixtures. This is useful then running GUI tests locally.
```
aw-web-server
```
##### Arguments
  * `-c`|`--config [file]`:  [BrowserSync config file ( json )](https://www.browsersync.io/docs/options/).

### aw-webdriver-test-runner
`aw-webdriver-test-runner` executes Protractor with the provided config and runs all test found in the provided specs path.
```
aw-webdriver-test-runner ./node_modules/after-work/dist/config/conf.js --specs ./test/component/*.spec.js
```
##### Arguments
  * `--specs`: Takes either a comma-separated list of files, or a glob pattern that has to be *stringified* with "<pattern>" in bash.

##### Available config files
  * **conf.js**: starts test in parallel, enables reporting and set up http server
  * **conf.dev.js**: starts only Chrome with direct connect (used for debugging/dev).

#### Defining repository based configs
You can extend the base configuration objects using [extend](https://www.npmjs.com/package/extend), if you want to make specific changes to the *base* configurations included in after-work.js.

##### Override default configs
Create a repository configuration file (common.js in this example):

```js
var extend = require( "after-work.js/node_modules/extend" );
var baseConfig = require( "after-work.js/dist/config/conf.dev.js" ).config;

var repoConfig = {
	multiCapabilities: [{
		"browserName": "chrome",
		chromeOptions: {
			// Get rid of --ignore-certificate yellow warning
			args: ['--no-sandbox', '--test-type=browser'],
			// Set download path and avoid prompting for download even though
			// this is already the default on Chrome but for completeness
			prefs: {
				download: {
					prompt_for_download: false,
					directory_upgrade: true,
					default_directory: process.cwd() +"\\downloads",
				},
			},
		},
	}],
}

var merged = extend( true, baseConfig, repoConfig );

exports.config = merged;
```

Use the merged *new* config as parameter to aw-webdriver-test-runner:

```sh
"scripts": {
"test:component": "aw-webdriver-test-runner <merged config file> --specs <grep pattern>"
}
```

## Debugging

### WebDriver node context
You need **Node Inspector** installed globally to debug the Protractor code:
```
npm install -g node-inspector
```
Start the aw-webdriver-test-runner with node-debug:
```
node-debug aw-webdriver-test-runner
```

### WebDriver Browser context
Install WebDriver to be able connect directly to chrome (using the WebDriver version specified by Protractor):

```sh
./node_modules/.bin/webdriver-manager update
```

1. Start a local web-server to host your web-files by using the runner **aw-web-server.js**. Default it will serve files from ./test/fixtures

2. Enable debugging in your test case by inserting a **browser.debugger()** statement. For more information, see [Debugging Protractor Tests](https://github.com/angular/protractor/blob/master/docs/debugging.md)

3. Start Protractor with the **conf.dev.js** which will start Chrome on your local computer

```js
aw-webdriver-test-runner ./node_modules/after-work.js/dist/config/conf.dev.js --specs ./test/component/*.comp.spec.js
```

## Protractor plugins
There are  two Protractor plugins developed and bundled together with after-work.js:
* **Screenshooter**: enables you to take a screenshot of an element and compare it to a saved baseline using an expect statement

```js
return expect( browser.takeImageOf( <element> ) ).to.eventually.matchImageOf( <baseline> );
```
* **Custom Reporter**: a mocha reporter that saves the test results into JSON. A HTML report is generated after the test is completed with the ability to show the different states of a rendering (Screenshooter) test.
