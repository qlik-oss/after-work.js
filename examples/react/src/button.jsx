/* eslint react/button-has-type: 0, react/jsx-one-expression-per-line: 0, react/destructuring-assignment: 0, max-len: 0 */

import React, { Component } from 'react';

class Button extends Component {
  render() {
    return (
      <button>{this.props.children}</button>
    );
  }
}

export default Button;
