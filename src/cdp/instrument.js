/* eslint global-require: 0, import/no-dynamic-require: 0 */
const path = require('path');

function transformFile(filePath, { babel, babelOpts }) {
  return (resolve, reject) => {
    babel.transformFile(filePath, babelOpts, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      const { code } = res;
      resolve(code);
    });
  };
}
function transform(...args) {
  return new Promise(transformFile(...args));
}

function tryRequire(name) {
  try {
    return require(`${name}`);
  } catch (_) {
    return require(`${process.cwd()}/node_modules/${name}`);
  }
}

module.exports = function instrument(files, exclude, coverage) {
  const babel = tryRequire('babel-core');
  const babelPluginIstanbul = tryRequire('babel-plugin-istanbul').default;
  const babelOpts = { plugins: coverage ? [babelPluginIstanbul] : [] };

  return async (ctx, next) => {
    await next();
    const { request, response } = ctx;
    // We need to remove the leading slash else it will be excluded by default for instrumentation
    const url = request.url.substring(1);
    if (exclude.shouldInstrument(url)) {
      const filePath = path.relative(process.cwd(), url);
      response.body = await transform(filePath, { babel, babelOpts });
    }
  };
};
