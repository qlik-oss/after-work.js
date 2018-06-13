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

module.exports = async function connect(argv, files, debugging) {
  const client = await CDP(argv.client);
  const { DOM, DOMStorage, Console, Network, Page, Runtime } = client;

  const injectMochaOptions = `window.mochaOptions = ${JSON.stringify(argv.mocha)}`;
  const injectAwFiles = `window.awFiles = ${JSON.stringify(files)}`;
  const injectAwDevtools = `window.awDevtools = ${JSON.stringify(argv.chrome.devtools)}`;
  const injectAwDebugging = `window.awDebugging = ${JSON.stringify(debugging)}`;

  await Promise.all([DOM.enable(), DOMStorage.enable(), Network.enable(), Page.enable(), Runtime.enable(), Console.enable()]);
  const sourceMapSupport = `${path.dirname(require.resolve('source-map-support'))}/browser-source-map-support.js`;
  await Page.addScriptToEvaluateOnLoad({ scriptSource: `${getContent(sourceMapSupport)};` });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: 'sourceMapSupport.install();' });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectMediator });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectMochaOptions });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectAwFiles });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectAwDevtools });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: injectAwDebugging });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: getContent(path.join(__dirname, 'browser-shim.js')) });
  return client;
};
