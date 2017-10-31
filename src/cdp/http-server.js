const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const instrument = require('./instrument');

const app = new Koa();

module.exports = function createHttpServer(files, coverage, nyc, options) {
  app.use(favicon(path.resolve(__dirname, '../../aw.png')));
  if (coverage) {
    app.use(instrument(files, nyc));
  }
  app.use(...options.root.map(root => serve(path.resolve(process.cwd(), root))));
  return app.listen(options.port);
};
