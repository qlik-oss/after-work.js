---
id: chrome-ts-examples
title: Chrome-ts
---

```javascript
import { expect } from 'chai';
import getA from '../src/a';

describe('chrome-ts A', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
```

```javascript
import { expect } from 'chai';
import getB from '../src/b';

describe('chrome-ts B', () => {
  it('should return "b"', () => {
    expect(getB()).to.equal('b');
  });
});
```

