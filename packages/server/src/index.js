const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const transformFiles = require('@after-work.js/transform-middleware');
const utils = require('@after-work.js/utils');
const testExclude = require('test-exclude');

module.exports = function createServer(options) {
  const http = Object.assign(
    {
      host: '0.0.0.0',
      port: 9000,
      root: ['./'],
      rewrite: {},
    },
    options.http,
  );
  const instrument = Object.assign({ exclude: '**' }, options.instrument);
  const instrumentExclude = testExclude({
    include: instrument.include,
    exclude: instrument.exclude,
  });
  const shouldInstrument = f => instrumentExclude.shouldInstrument(f);
  const transform = Object.assign({ exclude: '**' }, options.transform);
  const transformExclude = testExclude({
    include: transform.include,
    exclude: transform.exclude,
  });
  const shouldTransform = f => transformExclude.shouldInstrument(f);
  const babel = utils.coerceBabel({
    enable: true,
    babelPluginIstanbul: 'babel-plugin-istanbul',
    ...options.babel,
  });
  const opts = {
    shouldInstrument,
    shouldTransform,
    ...options,
    http: {
      ...http,
    },
    babel: {
      ...babel,
    },
  };
  const app = express();
  app.use(favicon(path.resolve(__dirname, '../aw.png')));
  app.use(transformFiles(opts));
  app.use('/', express.static(process.cwd()));
  return app.listen(opts.http.port, opts.http.host, (err) => {
    if (err) {
      throw err;
    }
    // eslint-disable-next-line no-console
    console.log(`Listening on http://${opts.http.host}:${opts.http.port}`);
  });
};
