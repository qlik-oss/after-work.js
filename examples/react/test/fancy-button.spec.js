/* global aw */
/* eslint import/no-unresolved: 0 */

import React from 'react';
import renderer from 'react-test-renderer';
import FancyButton from '../src/fancy-button';

describe('FancyButton', () => {
  it('renders fancy with button as span or div', () => {
    const [{ default: FancySpan }] = aw.mock(
      [['**/react/src/button.jsx', '() => (<span>hhhhh</span>)']],
      ['../src/fancy-button'],
    );
    const [{ default: FancyDiv }] = aw.mock(
      [['**/react/src/button.jsx', '() => (<div>ggggg</div>)']],
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
      [['**/react/src/button.jsx', './examples/react/test/button-mock.js']],
      ['../src/fancy-button'],
    );
    const tree1 = renderer
      .create(<FancyFileMock>file mock</FancyFileMock>)
      .toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
