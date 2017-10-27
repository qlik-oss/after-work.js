/* eslint object-curly-newline: 0, max-len: 0 */
const fs = require('fs');
const path = require('path');
const CDP = require('chrome-remote-interface');

function getContent(fileName) {
  const filePath = path.join(__dirname, fileName);
  return fs.readFileSync(filePath, 'utf-8');
}

module.exports = async function connect(options) {
  const client = await CDP(options.client);
  const { DOM, DOMStorage, Console, Network, Page, Runtime } = client;
  const mochaOptions = `window.mochaOptions = ${JSON.stringify(options.mocha || { ui: 'bdd', reporter: 'min', useColors: true })}`;
  await Promise.all([DOM.enable(), DOMStorage.enable(), Network.enable(), Page.enable(), Runtime.enable(), Console.enable()]);
  await Page.addScriptToEvaluateOnLoad({ scriptSource: mochaOptions });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: getContent('browser-mediator.js') });
  await Page.addScriptToEvaluateOnLoad({ scriptSource: getContent('browser-shim.js') });

  return client;
};
