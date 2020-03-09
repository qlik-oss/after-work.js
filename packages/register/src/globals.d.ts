declare var aw: {
  /**
   *
   * @param mocks - define mocks by key value pair where key supports glob pattern and value either a function that returns the mocked module or a string.
   * @param reqs - modules to be required.
   * @example
   * ```javascript
   * // Only call this in file scope or in a `Mocha` `before` hook to get correct coverage results.
   * // Mock components
   * //
   * const [{ default: A, }] = aw.mock([
   *   [
   *     require.resolve('../src/b'), () => <span>b</span>,
   *     require.resolve('../src/c'), () => <div>c</div>,
   *   ]
   *  ], ['../src/a']);
   * //
   * // Mock all css files to an empty string
   * //
   * aw.mock([['*.css', () => '']], ['../src/my-module']);
   * ```
   */
  mock(
    mocks: [string, string | (() => any)][],
    reqs: string[],
  ): NodeModule[];
};

