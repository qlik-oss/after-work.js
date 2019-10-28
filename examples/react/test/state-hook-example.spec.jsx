import React from 'react';
import renderer from 'react-test-renderer';
import Example, { MyCount } from '../src/state-hook-example';

describe('State hook example', () => {
  it('should not render `<MyCount /> by default', () => {
    const testRenderer = renderer.create(<Example />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(MyCount);
    expect(types).to.have.length(0);
  });
  it('should render `<MyCount />', () => {
    const testRenderer = renderer.create(<Example />);
    const testInstance = testRenderer.root;
    testInstance.findByType('button').props.onClick();
    const types = testInstance.findAllByType(MyCount);
    expect(types).to.have.length(1);
  });
  it('should render `<MyCount />', () => {
    const testRenderer = renderer.create(<Example />);
    const testInstance = testRenderer.root;
    testInstance.findByType('button').props.onClick();
    testInstance.findByType('button').props.onClick();
    const types = testInstance.findAllByType(MyCount);
    expect(types).to.have.length(2);
    const ps = testInstance.findAllByType('p');
    expect(ps[0].props.children).to.equal(1);
    expect(ps[1].props.children).to.equal(2);
  });
});
