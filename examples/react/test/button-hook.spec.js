/* global aw */
import React from 'react';
import renderer from 'react-test-renderer';
// import Button from '../src/button-hook';

describe('Button with hook', () => {
  it('renders', () => {
    const [{ default: ButtonHook }] = aw.mock([], ['../src/button-hook']);
    const tree1 = renderer.create(<ButtonHook>hook</ButtonHook>).toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
