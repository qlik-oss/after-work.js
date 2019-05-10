/* eslint react/button-has-type:0, react/jsx-one-expression-per-line: 0 */
import React, { useState } from 'react';

export default function MyButton() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
