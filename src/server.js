const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const rewrite = require('koa-rewrite');

module.exports = function createServer(options) {
  options = Object.assign({}, { port: 9000, root: ['./'], rewrite: {} }, options);
  const app = new Koa();
  app.use(favicon(path.resolve(__dirname, '../aw.png')));
  Object.keys(options.rewrite).forEach(key => app.use(rewrite(key, options.rewrite[key])));
  app.use(...options.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(options.port);
};
