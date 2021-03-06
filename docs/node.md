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

## Mocking

Built-in mocking. You can mock globally via the [**mocks**](#mocks) option or locally by using:

```javascript
const span = <span>my span</span>;
const [{ default: FancyButton }] = aw.mock(
  [
    // Mock components
    ['**/react/src/button.js', () => () => span]
  ],
  // Require components
  ['../src/fancy-button']
);
```

Look at the React [example](https://github.com/qlik-oss/after-work.js/tree/master/examples/react) for more details.

> If you are using `coverage` ensure you are only calling `aw.mock` in module scope or in a `before` function. If not, it will be instrumented multiple times and the last instrumentation wins, which will lead to incorrect coverage results. For example:

```javascript
import foo from 'foo';

const span = <span>my span</span>;

// Module scope 👍
const [{ default: FancyButton }] = aw.mock(
  [
    // Mock components
    [require.resolve('../src/fancy-button.js'), () => () => span]
  ],
  // Require components
  ['../src/fancy-button']
);

describe(() => {
  it('should calculate correct coverage', () => {});
});
```

or

```javascript
import foo from 'foo';

const span = <span>my span</span>;

describe(() => {
  let FancyButton;
  before(() => {
    // In before 👍
    const [{ default: FancyButton }] = aw.mock(
    [
      // Mock components
      [require.resolve('../src/fancy-button.js'), () => () => span]
    ],
    // Require components
    ['../src/fancy-button']
);

  });
  it('should calculate correct coverage', () => {});
});
```

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
