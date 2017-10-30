/* eslint object-curly-newline: 0, max-len: 0 */
const fs = require('fs');
const path = require('path');
const CDP = require('chrome-remote-interface');

const injectMediator = `
(function (win) {
  win.sessionStorage.setItem('aw', '');

  win.awMediator = {
    emit(name, data = '') {
      const json = JSON.stringify({ name, data });
      win.sessionStorage.setItem('aw', json);
    },
  };
}(window));
`;

function getContent(fileName) {
  const filePath = path.join(__dirname, fileName);
  return fs.readFileSync(filePath, 'utf-8');
}

module.exports = async function connect(options, files) {
  const client = await CDP(options.client);
  const { DOM, DOMStorage, Console, Network, Page, Runtime } = client;
  const mochaOptions = Object.assign({}, { ui: 'bdd', reporter: 'min', useColors: true }, options.mocha);
  if (options.debug) {
    mochaOptions.timeout = 0;
  }
  const injectMochaOptions = `window.mochaOptions = ${JSON.stringify(mochaOptions)}`;
  const awFiles = `window.awFiles = ${JSON.stringify(files)}`;

  await Promise.all([DOM.enable(), DOMStorage.enable(), Network.enable(), Page.enable(), Runtime.enable(), Console.enable()]);
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectMediator });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectMochaOptions });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: awFiles });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: getContent('browser-shim.js') });

  return client;
};
