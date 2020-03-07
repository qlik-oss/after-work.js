import React from 'react';
import renderer from 'react-test-renderer';

describe('context', () => {
  let sandbox;
  let action;
  let MyConsumerComponent;
  let hello;

  before(() => {
    sandbox = sinon.createSandbox();
    action = sandbox.spy();
    hello = 'Custom Consumer Test FOO';
    [{ default: MyConsumerComponent }] = aw.mock(
      [[require.resolve('../src/context.js'), () => props => props.children({ hello, action })]],
      ['../src/consumer'],
    );
  });

  it('renders custom consumer', () => {
    const component = renderer.create(<MyConsumerComponent />);
    const { root } = component;
    const button = root.findByType('button');
    button.props.onClick();

    expect(component.toJSON()).toMatchSnapshot();
    expect(action.called).to.equal(true);
    expect(action).calledWith(hello);
  });
});
