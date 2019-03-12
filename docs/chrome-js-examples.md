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

```javascript
import { expect } from 'chai';
import getB from '../src/b';

describe('chrome-js B', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
```

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

