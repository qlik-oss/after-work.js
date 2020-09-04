import React from "react";
import renderer from "react-test-renderer";

const span = "span";

const [{ default: FancySpan }] = aw.mock(
  [[require.resolve("../../src/button.jsx"), () => () => span]],
  ["../../src/fancy-button"]
);

describe("FancyButton", () => {
  it("renders fancy with button as span or div", () => {
    const tree1 = renderer.create(<FancySpan>span</FancySpan>).toJSON();
    expect(tree1).toMatchSnapshot();
  });

  // Don't copy paste this. It's just to make sure aw.mock works with a file
  it("renders fancy with button mock from file", () => {
    const [{ default: FancyFileMock }] = aw.mock(
      [
        [
          "**/react/src/button.jsx",
          "./examples/react/test/internal-aw-tests/button-mock.js",
        ],
      ],
      ["../../src/fancy-button"]
    );
    const tree1 = renderer
      .create(<FancyFileMock>file mock</FancyFileMock>)
      .toJSON();
    expect(tree1).toMatchSnapshot();
  });
});
