const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const transform = require('@after-work.js/server/src/transform');

module.exports = function createHttpServer(argv) {
  const app = new Koa();
  app.use(favicon(path.resolve(__dirname, '../../aw.png')));
  app.use(transform(argv));
  app.use(...argv.http.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(argv.http.port);
};
