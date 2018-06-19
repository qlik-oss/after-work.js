const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const rewrite = require('koa-rewrite');
const transformFiles = require('@after-work.js/transform-middleware');
const utils = require('@after-work.js/utils');
const testExclude = require('test-exclude');

module.exports = function createServer(options) {
  const http = Object.assign({ port: 9000, root: ['./'], rewrite: {} }, options.http);
  const instrument = Object.assign({ exclude: '**' }, options.instrument);
  const transform = Object.assign({ exclude: '**' }, options.transform);
  const tsc = utils.coerceTsc(options.tsc || {});
  const babel = utils.coerceBabel({
    enable: true,
    babelPluginIstanbul: 'babel-plugin-istanbul',
    ...options.babel,
  });
  const opts = {
    ...options,
    http: {
      ...http,
    },
    instrument: {
      testExclude: testExclude({ include: instrument.include, exclude: instrument.exclude }),
      ...instrument,
    },
    transform: {
      testExclude: testExclude({ include: transform.include, exclude: transform.exclude }),
      ...transform,
    },
    babel: {
      ...babel,
    },
    tsc,
  };
  const app = new Koa();
  app.use(favicon(path.resolve(__dirname, '../aw.png')));
  Object.keys(opts.http.rewrite).forEach(key => app.use(rewrite(key, opts.http.rewrite[key])));
  app.use(transformFiles(opts));
  app.use(...opts.http.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(opts.http.port);
};
