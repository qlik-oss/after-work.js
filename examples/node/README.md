# This is a sample for node and `after-work.js`

## From the project root run

```shell
./src/cli.js
```
This will automatically use `aw.config.js` since the `config` [option](https://github.com/qlik-oss/after-work.js/blob/v4/src/node/options.js#L5) defaults to `aw.config.js`

![](./node.gif)

## Generating coverage

To be able to generate coverage we need to serve the files with a http server and instrument the source files

```shell
./src/cli.js chrome --url http://localhost:9676/examples/requirejs/index.html --glob examples/requirejs/*.spec.js --coverage
```

![](./requirejs-coverage.gif)

## Debugging

Using [vscode](https://code.visualstudio.com/)

Install [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)

Add configuration to launch Chrome and the `cdp` runner

![](./requirejs-debug.gif)

If your favourite editor doesn't support chrome debugging you can pass the `chrome.devtools=true` option to run Chrome with `--auto-open-devtools-for-tabs`

```shell
./src/cli.js chrome --url http://localhost:9676/examples/requirejs/index.html --glob examples/requirejs/*.spec.js --chrome.devtools=true
```

![](./requirejs-debug-devtools.gif)
