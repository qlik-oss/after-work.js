---
id: node
title: Node
---

Run your test in a [Node](https://nodejs.org) environment with great developer workflow. Just start the runner with

```
npx aw -c ./path/to/aw.config.js -w --coverage
```

and start testing. It will only rerun affected tests and generate coverage accordingly.
Add files, remove files as you go and change your tests to rapidly build up a test coverage.

## Snapshot Testing

We are using the awesome 💖 [**jest-snapshot**](https://github.com/facebook/jest/tree/master/packages/jest-snapshot) package.

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


## Options

### --presetEnv [boolean] [default: true]

Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset.

<details><summary>Details</summary>
<p>

```javascript
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

### --config, -c [string] [default: null]

Path to config file.

### --glob [array] [default: ['test/\*\*/\*.spec.{js,ts}']]

Test glob pattern.

### --src [array] [default: ['src/\*\*/\*.{js,ts}]]

Glob pattern for all source files that should be loaded.

### --require [array] [default: []]

Require additional test setup files.

### --watch [boolean] [default: false]

Watch for changes

### --watchGlob, -wg [array] [default: ['src/\*\*/\*.{js,ts}', 'test/\*\*/\*.spec.{js,ts}']]

Glob pattern for watching files that will trigger a rerun.

### --coverage [boolean] [default: false]

Generate coverage

### --exit [boolean] [default: false]

Escape hatch for tests that aren’t cleaning up after themselves. This could be caused by a server still listening on a port or a setTimeout()/setInterval().

It´s possible to force exit by adding the `--exit` options but this could hide flaws in the test, causing sequential test to give false positive or false negative results.

### --updateSnapshot, -u [boolean] [default: false]

Update your snapshots.

### --hookRequire [boolean] [default: true]

Hook `require` to be able to mock and transform files


### --babel.enable [boolean] [default: true]

Enables babel tranformation

### --babel.core [string|module] [default: '']

Path to babel core module

### --babel.babelPluginIstanbul [string|module] [default: '']

Path to babel plugin istanbul module

### --babel.options [object] [default: {}]

Pass options to babel

### --babel.typescript [string] [default: 'typescript']

Path to typescript compiler module

### --mocks [array] [default: [['\*.{scss,less,css}']],]

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

### --mocha.reporter [string] [default: undefined]

Which reporter to use.

Check Mochas [**list**](https://mochajs.org/#reporters) for valid options.


### --mocha.bail [boolean] [default: true]

Bails on failure

### --mocha.timeout [number] [default: undefined]

Timeout in ms.

### --nyc.include [array] [default: []]

Include glob for coverage.

### --nyc.exclude [array] [default: ['\*\*/coverage/\*\*', '\*\*/dist/\*\*', '\*\*/\*.spec.{js,ts}']]

Exclude glob for coverage.

### --nyc.sourceMap [boolean] [default: false]

Sets if NYC should handle source maps.

### --nyc.tempDirectory [string] [default: './coverage/.nyc_output']

Directory to output raw coverage information to.

### --nyc.reporter [array] [default: ['lcov', 'text-summary']]

Coverage reporter(s) to use.


### --nyc.reportDir [string] [default: 'coverage']

Directory to output coverage reports in.
