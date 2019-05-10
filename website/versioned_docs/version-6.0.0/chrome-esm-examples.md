---
id: version-6.0.0-chrome-esm-examples
title: Chrome-esm
original_id: chrome-esm-examples
---

## Test

```javascript
// The .js is needed since that's what the browser will request and according to spec
import getA from '../src/a.js'; // eslint-disable-line import/extensions

describe('A', () => {
  it('should return "a"', () => {
    expect(getA()).to.equal('a');
  });
});
```

**[examples/chrome-esm/test/a.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/chrome-esm/test/a.spec.js)**

