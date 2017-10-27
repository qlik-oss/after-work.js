/* eslint no-underscore-dangle: 0, func-names: 0, no-undef: 0 */
(function (win) {
  win.sessionStorage.setItem('aw', '');

  win._mediator = {
    emit(name, data = '') {
      const json = JSON.stringify({ name, data });
      win.sessionStorage.setItem('aw', json);
    },
  };
}(window));
