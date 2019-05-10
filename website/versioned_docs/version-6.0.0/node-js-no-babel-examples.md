---
id: version-6.0.0-node-js-no-babel-examples
title: Node-js-no-babel
original_id: node-js-no-babel-examples
---

## Test

```javascript
const getAzure = require('../src/');

describe('Azure', () => {
  it('should work', () => {
    expect(getAzure()).to.equal('azure');
  });
});
```

**[examples/node-js-no-babel/test/index.spec.js](https://github.com/qlik-oss/after-work.js/tree/master/examples/node-js-no-babel/test/index.spec.js)**

