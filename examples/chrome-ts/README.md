# This is a sample for typescript

## From the project root run

```shell
./src/cli.js chrome -c examples/typescript/aw.config.js
```

![](./typescript.gif)

## Generating coverage

To be able to generate coverage we need to serve the files with a http server and instrument the source files

```shell
./src/cli.js chrome -c examples/typescript/aw.config.js --coverage
```

![](./typescript-coverage.gif)

## Debugging

Using [vscode](https://code.visualstudio.com/)

Install [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)

Add configuration to launch Chrome and the `cdp` runner

![](./typescript-debug.gif)

If your favourite editor doesn't support chrome debugging you can pass the `chrome.devtools=true` option to run Chrome with `--auto-open-devtools-for-tabs`

```shell
./src/cli.js chrome -c examples/typescript/aw.config.js --chrome.devtools=true
```

![](./typescript-debug-devtools.gif)
