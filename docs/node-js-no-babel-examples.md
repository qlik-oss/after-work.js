---
id: node-js-no-babel-examples
title: Node-js-no-babel
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

