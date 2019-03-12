---
id: node-js-no-babel-examples
title: Node-js-no-babel
---

```javascript
const getAzure = require('../src/');

describe('Azure', () => {
  it('should work', () => {
    expect(getAzure()).to.equal('azure');
  });
});
```

