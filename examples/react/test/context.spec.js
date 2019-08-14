import React from 'react';
import renderer from 'react-test-renderer';

describe('context', () => {
  const mock = (context) => aw.mock(
    [['**/src/context.js', () => (props) => props.children(context)]],
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
