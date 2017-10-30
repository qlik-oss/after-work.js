const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');
const instrument = require('./instrument');

const app = new Koa();

module.exports = function server(url, files, coverage, nyc, options) {
  if (/^(http(s?)):\/\//.test(url)) {
    app.use(favicon(path.resolve(__dirname, '../../aw.png')));
    if (coverage) {
      app.use(instrument(files, nyc));
    }
    app.use(...options.root.map(root => serve(path.resolve(process.cwd(), root))));
    app.listen(options.port);
  }
};
