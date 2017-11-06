const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const instrument = require('./instrument');

module.exports = function createHttpServer(files, exclude, coverage, httpOpts) {
  const app = new Koa();
  app.use(favicon(path.resolve(__dirname, '../../aw.png')));
  app.use(instrument(files, exclude, coverage));
  app.use(...httpOpts.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(httpOpts.port);
};
