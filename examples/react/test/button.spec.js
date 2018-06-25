import React from 'react';
import renderer from 'react-test-renderer';
import 'foo.scss'; // eslint-disable-line import/no-unresolved
import 'bar.less'; // eslint-disable-line import/no-unresolved
import 'baz.css'; // eslint-disable-line import/no-unresolved
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
