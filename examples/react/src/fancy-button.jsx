/* eslint react/button-has-type: 0, react/jsx-one-expression-per-line: 0, react/destructuring-assignment: 0, max-len: 0 */

import React, { Component } from 'react';
import Button from './button';

class FancyButton extends Component {
  render() {
    return (
      <div>
        <Button>{this.props.children}</Button>
      </div>
    );
  }
}

export default FancyButton;
