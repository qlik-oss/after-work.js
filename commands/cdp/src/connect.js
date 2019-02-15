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

module.exports = async function connect(argv, files, presetEnv, debugging) {
  const client = await CDP(argv.client);
  const { DOM, DOMStorage, Console, Network, Page, Runtime } = client;

  const { bail, useColors, reporter, ui, timeout } = argv.mocha;
  const injectMochaOptions = `window.mochaOptions = ${JSON.stringify({
    bail,
    useColors,
    reporter,
    ui,
    timeout,
  })}`;
  const injectAwFiles = `window.awFiles = ${JSON.stringify(files)}`;
  const injectAwDevtools = `window.awDevtools = ${JSON.stringify(
    argv.chrome.devtools,
  )}`;
  const injectAwDebugging = `window.awDebugging = ${JSON.stringify(debugging)}`;

  await Promise.all([
    DOM.enable(),
    DOMStorage.enable(),
    Network.enable(),
    Page.enable(),
    Runtime.enable(),
    Console.enable(),
  ]);
  const sourceMapSupport = `${path.dirname(
    require.resolve('source-map-support'),
  )}/browser-source-map-support.js`;
  await Page.addScriptToEvaluateOnNewDocument({
    source: `${getContent(sourceMapSupport)};`,
  });
  await Page.addScriptToEvaluateOnNewDocument({
    source: 'sourceMapSupport.install();',
  });
  await Page.addScriptToEvaluateOnNewDocument({ source: injectMediator });
  await Page.addScriptToEvaluateOnNewDocument({
    source: injectMochaOptions,
  });
  await Page.addScriptToEvaluateOnNewDocument({ source: injectAwFiles });
  await Page.addScriptToEvaluateOnNewDocument({
    source: injectAwDevtools,
  });
  await Page.addScriptToEvaluateOnNewDocument({
    source: injectAwDebugging,
  });
  await Page.addScriptToEvaluateOnNewDocument({
    source: getContent(path.join(__dirname, 'browser-shim.js')),
  });
  if (presetEnv) {
    await Page.addScriptToEvaluateOnNewDocument({
      source: getContent(require.resolve('chai/chai')),
    });
    await Page.addScriptToEvaluateOnNewDocument({
      source: 'expect = chai.expect;',
    });
    await Page.addScriptToEvaluateOnNewDocument({
      source: getContent(require.resolve('chai-subset/lib/chai-subset')),
    });
    await Page.addScriptToEvaluateOnNewDocument({
      source: getContent(require.resolve('sinon-chai/lib/sinon-chai')),
    });
    await Page.addScriptToEvaluateOnNewDocument({
      source: getContent(require.resolve('sinon/pkg/sinon')),
    });
  }
  return client;
};
