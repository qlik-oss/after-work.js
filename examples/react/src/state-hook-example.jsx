/* eslint-disable react/no-array-index-key */
/* eslint-disable react/button-has-type */
import React, { useState } from 'react';

// eslint-disable-next-line react/prop-types
export const MyCount = ({ n }) => (
  <p>
    {n}
  </p>
);

export default function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState([]);

  return (
    <div>
      {count.map((n, ix) => (<MyCount key={ix} n={n} />))}
      <button onClick={() => setCount([...count, count.length + 1])}>Click me</button>
    </div>
  );
}
