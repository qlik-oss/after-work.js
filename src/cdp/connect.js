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

function getContent(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

module.exports = async function connect(options, files) {
  const client = await CDP(options.client);
  const { DOM, DOMStorage, Console, Network, Page, Runtime } = client;

  const injectMochaOptions = `window.mochaOptions = ${JSON.stringify(options.mocha)}`;
  const injectAwFiles = `window.awFiles = ${JSON.stringify(files)}`;
  const injectAwDevtools = `window.awDevtools = ${JSON.stringify(options.chrome.devtools)}`;

  await Promise.all([DOM.enable(), DOMStorage.enable(), Network.enable(), Page.enable(), Runtime.enable(), Console.enable()]);
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectMediator });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectMochaOptions });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectAwFiles });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectAwDevtools });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: getContent(path.join(__dirname, 'browser-shim.js')) });

  return client;
};
