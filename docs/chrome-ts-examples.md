---
id: chrome-ts-examples
title: Chrome-ts
---

## Test

```javascript
import { expect } from 'chai';
import getA from '../src/a';

describe('chrome-ts A', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
```

**[examples/chrome-ts/test/a.spec.ts](https://github.com/qlik-oss/after-work.js/tree/master/examples/chrome-ts/test/a.spec.ts)**

## Test

```javascript
import { expect } from 'chai';
import getB from '../src/b';

describe('chrome-ts B', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
```

**[examples/chrome-ts/test/b.spec.ts](https://github.com/qlik-oss/after-work.js/tree/master/examples/chrome-ts/test/b.spec.ts)**

