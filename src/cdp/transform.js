/* eslint global-require: 0, import/no-dynamic-require: 0 */
const path = require('path');

function tryRequire(name) {
  try {
    return require(`${name}`);
  } catch (_) {
    return require(`${process.cwd()}/node_modules/${name}`);
  }
}

const babel = tryRequire('babel-core');
const babelPluginIstanbul = tryRequire('babel-plugin-istanbul').default;

function transformFile(filePath, coverage) {
  return (resolve, reject) => {
    const babelOpts = { plugins: coverage ? [[babelPluginIstanbul, {}]] : [] };
    babel.transformFile(filePath, babelOpts, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const { code } = res;
        resolve(code);
      }
    });
  };
}
function transformify(filePath, coverage) {
  return new Promise(transformFile(filePath, coverage));
}

module.exports = function transform(files, exclude, coverage, coverageExclude) {
  const shouldInstrument = url => (coverage ?
    coverageExclude.shouldInstrument(url) :
    exclude.shouldInstrument(url));

  return async (ctx, next) => {
    await next();
    const { request, response } = ctx;
    // We need to remove the leading slash else it will be excluded by default for instrumentation
    const url = request.url.substring(1);
    if (shouldInstrument(url)) {
      const filePath = path.relative(process.cwd(), url);
      response.body = await transformify(filePath, coverage);
    }
  };
};
