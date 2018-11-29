const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const transformFiles = require('@after-work.js/transform-middleware');

module.exports = function createServer(options, skipParse = false) {
  const app = express();
  app.use(favicon(path.resolve(__dirname, '../aw.png')));
  app.use(transformFiles(options, skipParse));
  app.use('/', express.static(process.cwd()));
  return app.listen(options.http.port, '0.0.0.0', (err) => {
    if (err) {
      throw err;
    }
    // eslint-disable-next-line no-console
    console.error(`Listening on http://0.0.0.0:${options.http.port}`);
  });
};
