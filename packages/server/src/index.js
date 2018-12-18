const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const transformFiles = require('@after-work.js/transform-middleware');

module.exports = function createServer(options) {
  const { middleware = () => {}, ...argv } = options;
  const app = express();
  app.use(favicon(path.resolve(__dirname, '../aw.png')));
  app.use(transformFiles(argv));
  app.use('/', express.static(process.cwd()));
  middleware(app, express);
  return app.listen(argv.http.port, '0.0.0.0', (err) => {
    if (err) {
      throw err;
    }
    // eslint-disable-next-line no-console
    console.error(`Listening on http://0.0.0.0:${argv.http.port}`);
  });
};
