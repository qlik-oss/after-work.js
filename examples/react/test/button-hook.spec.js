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
