---
id: development
title: Development
---

* [Getting started](#getting-started)
  * [Clone](#clone)
  * [Installation](#installation)
  * [Testing](#testing)
  * [Debugging](#debugging)
  * [Debugging with Chrome](#debugging-with-chrome)
  * [Testing local changes](#testing-local-changes)

## Getting started

### Clone

```sh
git clone git@github.com:qlik-oss/after-work.js.git
```

### Installation

Go into the cloned folder:

```sh
npm i
```

Since we are using [Lerna](https://lernajs.io/) with hoisting run:

```sh
npm run bootstrap
```

### Testing

Run all tests with:

```sh
npm test
```

This will run all `after-work.js` tests with `after-work.js` itself.

### Debugging

For easy debugging using [vscode](https://code.visualstudio.com/download) just add a `.vscode/launch.json`.

<details><summary>launch.json</summary>
<p>

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "NodeRunner",
      "program": "${workspaceRoot}/commands/aw/src/index.js",
      "args": [
        "-c",
        "aw.config.js",
        "--glob",
        "${file}"
      ]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "ChromeRunner",
      "program": "${workspaceRoot}/commands/aw/src/index.js",
      "args": [
        "chrome",
        "-c",
        "aw.config.js",
        "--glob",
        "${file}"
      ]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "ChromeHeadless",
      "port": 9222,
      "url": "http://localhost:9676/examples/index.html",
      "webRoot": "${workspaceFolder}",
      "runtimeArgs": [
        "--headless",
        "--disable-gpu"
      ]
    }
  ],
  "compounds": [
    {
      "name": "ChromeDebug",
      "configurations": [
        "ChromeHeadless",
        "ChromeRunner"
      ]
    }
  ]
}

```

</p>
</details>

<br>

Add a breakpoint in any  `*.{js,ts}` and hit F5 and off you go...

### Debugging with Chrome

To debug in Chrome just pass:

```sh
npx aw chrome -c aw.config.js --chrome.devtools=true
```

This will ensure to auto open devtools in your Chrome instance and waiting for it to attach.
Add a `debugger` statement in any file and it will break right into it 🚀.

### Testing local changes

`after-work.js` is designed to be run directly without installing it. Just go into the project you want to test and point to your local entry point:

```sh
../after-work.js/commands/aw/src/index.js
```

This will run `after-work.js` with your local changes 💥.
