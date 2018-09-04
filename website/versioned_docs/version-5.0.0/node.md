---
id: version-5.0.0-node
title: Node
original_id: node
---

Run your test in a [Node](https://nodejs.org) environment with great developer workflow. Just start the runner with

```
npx aw -c ./path/to/aw.config.js -w --coverage
```

and start testing. It will only rerun affected tests and generate coverage accordingly.
Add files, remove files as you go and change your tests to rapidly build up a test coverage.

## Mocking

Built-in mocking. You can mock globally via the [**mocks**](#mocks) option or locally by using:

```javascript
const [FancyButton] = aw.mock(
  [ // Mock components
    ['**/react/src/button.js', '() => (<span>hhhhh</span>)']
  ],
  // Require components
  ['../src/fancy-button']);
```

Look at the React [example](https://github.com/qlik-oss/after-work.js/tree/master/examples/react) and especially [**here**](https://github.com/qlik-oss/after-work.js/blob/master/examples/react/test/fancy-button.spec.js) for more details.

## Snapshot Testing

We are using the awesome 📸 [**jest-snapshot**](https://github.com/facebook/jest/tree/master/packages/jest-snapshot) package.

<details><summary>Example</summary>
<p>

```javascript
import React from 'react';
import renderer from 'react-test-renderer';
import 'foo.scss';
import 'bar.less';
import 'baz.css';
import Button from '../src/button';

describe('button', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Button>Text</Button>).toJSON();
    expect(tree).toMatchSnapshot();
    const tree1 = renderer.create(<Button>Text1</Button>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
  it('renders fancy', () => {
    const tree1 = renderer.create(<Button>fancy1</Button>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
```

</p>
</details>

## Screenshot testing

When using the preset-env option. A screenshot assertion plugin is added to Chai. This allows comparisons of images.

<details><summary>Example</summary>
<p>

```javascript
describe('screenshot', () => {
  it('image should be equal', async () => {
    const img = Promise.resolve('<base64-encoded-image>'); //  Promise that resolves to Buffer or a base64 encoded image
    await expect(img).to.matchImageOf('<name-of-my-img-on-disk>', {
      artifactsPath: 'tests/__artifacts__',
      tolerance: 0.002
    });
  });
});
```

</p>
</details>

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

### --coverage

 | Description        | Type    | Default |
 | ------------------ | ------- | ------- |
 | Generate coverage. | boolean | false   |

---

### --exit

 | Description                                                       | Type    | Default |
 | ----------------------------------------------------------------- | ------- | ------- |
 | Escape hatch for tests that are not cleaning up after themselves. | boolean | false   |

>⚠️ This could be caused by a server still listening on a port or a setTimeout()/setInterval().
It´s possible to force exit by adding the `--exit` options but this could hide flaws in the test, causing sequential test to give false positive or false negative results.

---

### --updateSnapshot

 | Description            | Type    | Default | Alias |
 | ---------------------- | ------- | ------- | ----- |
 | Update your snapshots. | boolean | false   | -u    |

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

### --mocks

 | Description   | Type  | Default                  |
 | ------------- | ----- | ------------------------ |
 | Mock modules. | array | [['\*.{scss,less,css}']] |

<details><summary>Details</summary>
<p>

```javascript

mocks: [
    ['**/cdp/src/browser-shim.js', '{}'],
    ['**/*.{scss,less,css,html}'],
    ['./foobar-virtual.html', '"<div>hello world</div>"'],
  ],

```

</p>
</details>

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

### --nyc.include

 | Description                | Type  | Default |
 | -------------------------- | ----- | ------- |
 | Include glob for coverage. | array | []      |

---

### --nyc.exclude

 | Description                | Type  | Default                                                          |
 | -------------------------- | ----- | ---------------------------------------------------------------- |
 | Exclude glob for coverage. | array | ['\*\*/coverage/\*\*', '\*\*/dist/\*\*', '\*\*/\*.spec.{js,ts}'] |

---

### --nyc.sourceMap

 | Description                            | Type    | Default |
 | -------------------------------------- | ------- | ------- |
 | Sets if NYC should handle source maps. | boolean | false   |

---

### --nyc.tempDirectory

 | Description                                      | Type   | Default                  |
 | ------------------------------------------------ | ------ | ------------------------ |
 | Directory to output raw coverage information to. | string | './coverage/.nyc_output' |

---

### --nyc.reporter

 | Description                  | Type  | Default                  |
 | ---------------------------- | ----- | ------------------------ |
 | Coverage reporter(s) to use. | array | ['lcov', 'text-summary'] |

---

### --nyc.reportDir

 | Description                              | Type   | Default   |
 | ---------------------------------------- | ------ | --------- |
 | Directory to output coverage reports in. | string | 'coverage' |

---
