const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const transformFiles = require('@after-work.js/transform-middleware');
const applyProxies = require('./proxies');

module.exports = function createServer(options) {
  const { middleware = () => {}, ...argv } = options;
  const app = express();
  app.use(favicon(path.resolve(__dirname, '../aw.png')));
  app.use(transformFiles(argv));
  app.use('/', express.static(process.cwd()));
  const websocketProxies = applyProxies(app, options.proxy);
  middleware(app, express);
  const server = app.listen(argv.http.port, '0.0.0.0', (err) => {
    if (err) {
      throw err;
    }
  });
  websocketProxies.forEach(wsProxy => server.on('upgrade', wsProxy.upgrade));
  return server;
};
