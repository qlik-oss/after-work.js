/* globals requirejs, window */
(() => {
  requirejs.config({
    paths: {
      chai: '/node_modules/chai/chai',
    },
  });
  requirejs(window.awFiles, () => {
    if (window.awDevtools) {
      // We need to wait for Chrome to open the `devtools`
      setTimeout(() => mocha.run(), 200);
      return;
    }
    mocha.run();
  });
})();
