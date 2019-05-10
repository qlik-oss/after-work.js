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
