import React from 'react';
import Consumer from './context';

export default () => (
  <Consumer>
    {({ hello, action }) => (<button type="submit" onClick={() => action(hello)}>{hello}</button>)}
  </Consumer>
);
