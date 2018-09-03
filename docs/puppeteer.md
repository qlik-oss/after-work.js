---
id: puppeteer
title: Puppeteer
---

Run your test headless/headful in Chrome with great developer workflow. Just start the runner with

```
npx aw puppeteer -c ./path/to/aw.config.js -w
```

and start testing. It will only rerun affected tests on save.
Add files, remove files as you go and change your tests to rapidly build up a test coverage.

## Options

### --presetEnv

 | Description                                                                                 | Type    | Default |
 | ------------------------------------------------------------------------------------------- | ------- | ------- |
 | Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset. | boolean | true    |

<details><summary>Details</summary>
<p>

```javascript
const screenshotPlugin = require('@after-work.js/chai-plugin-screenshot');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');

global.sinon = sinon;
global.chai = chai;
global.expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiSubset);
chai.Assertion.addMethod('matchImageOf', screenshotPlugin.matchImageOf);
```

This enables writing your tests like this:

```javascript
const hello = require('../src/hello');

describe('hello', () => {
  it('should say world', () => {
    expect(hello()).to.equal('world');
  });
});
```

</p>
</details>

---

### --config

 | Description          | Type   | Default | Alias |
 | -------------------- | ------ | ------- | ----- |
 | Path to config file. | string | null    | -c    |

---

### --glob

 | Description        | Type  | Default                       |
 | ------------------ | ----- | ----------------------------- |
 | Test glob pattern. | array | ['test/\*\*/\*.spec.{js,ts}'] |

---

### --src

 | Description                                              | Type  | Default                |
 | -------------------------------------------------------- | ----- | ---------------------- |
 | Glob pattern for all source files that should be loaded. | array | ['src/\*\*/\*.{js,ts}] |

---

### --require

 | Description                          | Type  | Default |
 | ------------------------------------ | ----- | ------- |
 | Require additional test setup files. | array | []      |

---

### --watch

 | Description        | Type    | Default |
 | ------------------ | ------- | ------- |
 | Watch for changes. | boolean | false   |

---

### --watchGlob

 | Description                                                | Type  | Default                                              |
 | ---------------------------------------------------------- | ----- | ---------------------------------------------------- |
 | Glob pattern for watching files that will trigger a rerun. | array | ['src/\*\*/\*.{js,ts}', 'test/\*\*/\*.spec.{js,ts}'] |

---

### --hookRequire

 | Description                                            | Type    | Default |
 | ------------------------------------------------------ | ------- | ------- |
 | Hook `require` to be able to mock and transform files. | boolean | true    |

---

### --babel.enable

 | Description                  | Type    | Default |
 | ---------------------------- | ------- | ------- |
 | Enables babel tranformation. | boolean | true    |

---

### --babel.core

 | Description                | Type   | Default |
 | -------------------------- | ------ | ------- |
 | Path to babel core module. | string | ''      |

---

### --babel.babelPluginIstanbul

 | Description                           | Type   | Default |
 | ------------------------------------- | ------ | ------- |
 | Path to babel plugin istanbul module. | string | ''      |

---

### --babel.options

 | Description            | Type   | Default |
 | ---------------------- | ------ | ------- |
 | Pass options to babel. | object | {}      |

---

### --babel.typescript

 | Description                         | Type   | Default      |
 | ----------------------------------- | ------ | ------------ |
 | Path to typescript compiler module. | string | 'typescript' |

---

### --mocha.reporter

 | Description            | Type   | Default   |
 | ---------------------- | ------ | --------- |
 | Which reporter to use. | string | undefined |

Check Mochas [**list**](https://mochajs.org/#reporters) for valid options.

---

### --mocha.bail

 | Description      | Type    | Default |
 | ---------------- | ------- | ------- |
 | Bail on failure. | boolean | true    |

---

### --mocha.timeout

 | Description    | Type   | Default   |
 | -------------- | ------ | --------- |
 | Timeout in ms. | number | undefined |

---

### --chrome.headless

| Description          | Type    | Default |
| -------------------- | ------- | ------- |
| Run Chrome headless. | boolean | true    |

### --chrome.args

| Description   | Type  | Default |
| ------------- | ----- | ------- |
| Chrome flags. | array | []      |

### --chrome.stable

| Description        | Type    | Default |
| ------------------ | ------- | ------- |
| Use Chrome stable. | boolean | true    |


## Developer workflow

Watch your tests and only rerun affected files on save. 💥

Debug the node side and the chrome side simultaneously. 🛠

## Teaser

<video controls style="max-width: 100%">
  <source src="/videos/puppeteer-debug.mp4" type="video/mp4">
  <p>Your browser doesn't support HTML5 video. Here is
     a <a href="/videos/puppeteer-debug.mp4">link to the video</a> instead.</p>
</video>

## Debugging

<details><summary>VS Code launch config</summary>
<p>

```js
    {
      "type": "node",
      "request": "launch",
      "name": "puppeteteer",
      "program": "${workspaceRoot}/commands/aw/src/index.js",
      "args": [
        "puppeteer",
        "-c",
        "examples/puppeteer/aw.config.js",
        "--chrome.headless",
        "false",
        "--chrome.devtools",
        "true",
        "--chrome.userDataDir=./.chrome-profile",
        "-w"
      ]
    },
```

</p>
</details>
