---
id: node-js-examples
title: Node-js
---

```javascript
import virtual from './foobar-virtual.html';
import template from './foobar.html';

describe('html', () => {
  it('should import virtual template', () => {
    expect(virtual).toMatchSnapshot();
  });

  it('should import template', () => {
    expect(template).toMatchSnapshot();
  });
});
```

