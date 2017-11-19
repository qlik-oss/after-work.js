const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const transform = require('./transform');

module.exports = function createHttpServer(exclude, coverage, coverageExclude, httpOpts) {
  const app = new Koa();
  app.use(favicon(path.resolve(__dirname, '../../aw.png')));
  app.use(transform(exclude, coverage, coverageExclude));
  app.use(...httpOpts.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(httpOpts.port);
};
