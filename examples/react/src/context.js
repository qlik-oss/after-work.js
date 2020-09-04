/* eslint react/no-unused-state: 0 */
import React from "react";

const Context = React.createContext({ hello: "defaultContext" });

export default Context.Consumer;
