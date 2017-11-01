const path = require('path');
const babel = require('babel-core');
const babelPluginIstanbul = require('babel-plugin-istanbul').default;

function transformFile(filePath) {
  return (resolve, reject) => {
    babel.transformFile(filePath, {
      plugins: [[babelPluginIstanbul, {}]],
    }, (err, res) => {
      if (err) {
        reject(err);
      }
      const { code } = res;
      resolve(code);
    });
  };
}
function transform(filePath) {
  return new Promise(transformFile(filePath));
}

module.exports = function instrument(files, nyc) {
  return async (ctx, next) => {
    await next();
    const { request, response } = ctx;
    // We need to remove the leading slash else it will be excluded by default for instrumentation
    const url = request.url.substring(1);

    if (nyc.exclude.shouldInstrument(url)) {
      const filePath = path.relative(process.cwd(), url);
      response.body = await transform(filePath);
    }
  };
};
