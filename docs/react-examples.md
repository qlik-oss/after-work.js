---
id: react-examples
title: React
---

```javascript
import React from 'react';
import renderer from 'react-test-renderer';

describe('Button with hook', () => {
  it('renders', () => {
    const [{ default: ButtonHook }] = aw.mock([], ['../src/button-hook']);
    const tree1 = renderer.create(<ButtonHook>hook</ButtonHook>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
  it('renders button hook', () => {
    const span = <span>hook</span>;
    const [ButtonHook] = aw.mock(
      [['**/react/src/button-hook.jsx', () => () => span]],
      ['../src/button-hook'],
    );
    const tree1 = renderer.create(<ButtonHook>span</ButtonHook>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
```

```javascript
import React from 'react';
import renderer from 'react-test-renderer';
import 'foo.scss';
import 'bar.less';
import 'baz.css';
import 'mocked-special';

import Button from '../src/button';

describe('button', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Button>Text</Button>).toJSON();
    expect(tree).toMatchSnapshot();
    const tree1 = renderer.create(<Button>Text1</Button>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
  it('renders fancy', () => {
    const tree1 = renderer.create(<Button>fancy1</Button>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
```

```javascript
import React from 'react';
import renderer from 'react-test-renderer';

describe('context', () => {
  const mock = context => aw.mock(
    [['**/src/context.js', () => props => props.children(context)]],
    ['../src/consumer'],
  );

  it('renders custom consumer', () => {
    const action = sinon.spy();
    const hello = 'Custom Consumer Test FOO';
    const [{ default: MyConsumerComponent }] = mock({ hello, action });
    const component = renderer.create(<MyConsumerComponent />);
    const { root } = component;
    const button = root.findByType('button');
    button.props.onClick();

    expect(component.toJSON()).toMatchSnapshot();
    expect(action.called).to.equal(true);
    expect(action).calledWith(hello);
  });
});
```

```javascript
import React from 'react';
import renderer from 'react-test-renderer';
import FancyButton from '../src/fancy-button';

describe('FancyButton', () => {
  it('renders fancy with button as span or div', () => {
    const span = <span>hhhhh</span>;
    const [{ default: FancySpan }] = aw.mock(
      [['**/react/src/button.jsx', () => () => span]],
      ['../src/fancy-button'],
    );
    const ggggg = <div>ggggg</div>;
    const [{ default: FancyDiv }] = aw.mock(
      [['**/react/src/button.jsx', () => () => ggggg], ['**/muppet', () => {}]],
      ['../src/fancy-button'],
    );
    const tree1 = renderer.create(<FancySpan>span</FancySpan>).toJSON();
    const tree2 = renderer.create(<FancyDiv>div</FancyDiv>).toJSON();
    expect(tree1).toMatchSnapshot();
    expect(tree2).toMatchSnapshot();
  });

  it('renders fancy with button as is', () => {
    const [{ default: FancyPancy }] = aw.mock([], ['../src/fancy-button']);
    const tree1 = renderer.create(<FancyPancy>pancy</FancyPancy>).toJSON();
    expect(tree1).toMatchSnapshot();
  });

  it('renders fancy with button as is from import', () => {
    const tree1 = renderer.create(<FancyButton>fancy1</FancyButton>).toJSON();
    expect(tree1).toMatchSnapshot();
  });

  it('renders fancy with button mock from file', () => {
    const [{ default: FancyFileMock }] = aw.mock(
      [
        ['**/react/src/button.jsx', './examples/react/test/button-mock.js'],
        ['foo', () => {}],
      ],
      ['../src/fancy-button'],
    );
    const tree1 = renderer
      .create(<FancyFileMock>file mock</FancyFileMock>)
      .toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
```

```javascript
describe('Full match', () => {
  it('can mock', () => {
    const [{ default: fullMatch }] = aw.mock(
      [['@foo/bar', () => 'bar']],
      ['../src/full-match'],
    );
    expect(fullMatch).to.equal('bar');
  });
});
```

