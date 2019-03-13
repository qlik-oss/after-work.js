---
id: chrome-js-examples
title: Chrome-js
---

```javascript
import getA from '../src/a';

describe('chrome-js A', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
```

**[examples/chrome-js/test/a.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/chrome-js/test/a.spec.js)**

```javascript
import { expect } from 'chai';
import getB from '../src/b';

describe('chrome-js B', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
```

**[examples/chrome-js/test/b.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/chrome-js/test/b.spec.js)**

```javascript
import c from '../src/c';

describe('chrome-js C', () => {
  let sandbox;
  let foo;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    foo = sandbox.spy(c, 'foo');
  });
  afterEach(() => sandbox.restore());

  it('should be able to use sinon, sinon-chai', () => {
    c.foo();
    expect(foo).to.have.been.calledOnce;
  });
  it('should be able to use chai-subset', () => {
    const obj = {
      a: 'b',
      c: {
        foo: 'bar',
      },
    };
    expect(obj).to.containSubset({
      c: {
        foo: 'bar',
      },
    });
  });
});
```

**[examples/chrome-js/test/c.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/chrome-js/test/c.spec.js)**

