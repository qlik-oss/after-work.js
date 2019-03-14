---
id: node-ts-examples
title: Node-ts
---

## Test

```javascript
import { expect } from 'chai';
import Dummy from '../src/dummy';

describe('Dummy', () => {
  it('should work with typescript', () => {
    const dummy = new Dummy();
    expect(dummy.publicMethod()).to.equal('dummy');
  });
});
```

**[examples/node-ts/test/dummy.spec.ts](https://github.com/qlik-oss/after-work.js/tree/master/examples/node-ts/test/dummy.spec.ts)**

