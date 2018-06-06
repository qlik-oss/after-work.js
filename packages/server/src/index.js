const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const rewrite = require('koa-rewrite');
const transform = require('@after-work.js/transform-middleware');
const testExclude = require('test-exclude');

module.exports = function createServer(options) {
  options = Object.assign({}, { http: { port: 9000, root: ['./'], rewrite: {} }, instrument: { exclude: '**' }, transform: { exclude: '**' } }, options); //eslint-disable-line
  options.instrument.testExclude = options.instrument.testExclude || testExclude({ include: options.instrument.include, exclude: options.instrument.exclude }); //eslint-disable-line
  options.transform.testExclude = options.transform.testExclude || testExclude({ include: options.transform.include, exclude: options.transform.exclude }); //eslint-disable-line
  const app = new Koa();
  app.use(favicon(path.resolve(__dirname, '../../../aw.png')));
  Object.keys(options.http.rewrite).forEach(key => app.use(rewrite(key, options.http.rewrite[key]))); // eslint-disable-line max-len
  app.use(transform(options));
  app.use(...options.http.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(options.http.port);
};
