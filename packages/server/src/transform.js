/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0 */
const path = require('path');
const fs = require('fs');
const importCwd = require('import-cwd');
const { isSourceMap, isTypescript, getPathWithExt, ensureFilePath } = require('@after-work.js/file-utils');

function getModule(name) {
  const found = importCwd.silent(name);
  if (!found) {
    return require(`${name}`);
  }
  return found;
}

const babel = getModule('@babel/core');
const babelPluginIstanbul = getModule('babel-plugin-istanbul').default;
const tsc = getModule('typescript');
const cacheSourceMap = new Map();
const cacheTransform = new Map();

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(content);
    });
  });
}

function getBabelOpts(filePath, argv) {
  const sourceRoot = argv.coverage ? path.dirname(filePath) : undefined;
  const filename = filePath;
  const plugins = argv.coverage && argv.instrument.testExclude.shouldInstrument(filePath) ?
    [[babelPluginIstanbul, {}]] :
    [];
  return { filename, sourceRoot, plugins };
}

function transformTypescript(filePath, sourceRoot, tsContent, argv) {
  const { transform: { typescript: { compilerOptions } } } = argv;
  const fileName = argv.coverage ? path.basename(filePath) : filePath;
  compilerOptions.sourceRoot = argv.coverage ? path.resolve(path.dirname(filePath)) : sourceRoot;
  compilerOptions.inlineSources = true;
  if (!compilerOptions.sourceMap && !compilerOptions.inlineSourceMap) {
    compilerOptions.inlineSourceMap = true;
  }
  if (!compilerOptions.module) {
    compilerOptions.module = 'esnext';
  }
  const transpileOpts = { fileName, compilerOptions };
  const res = tsc.transpileModule(tsContent, transpileOpts);
  tsContent = res.outputText; // eslint-disable-line no-param-reassign
  let tsBabelOpts = {};

  if (res.sourceMapText) {
    const inputSourceMap = JSON.parse(res.sourceMapText);
    tsBabelOpts = { sourceMaps: true, inputSourceMap };
  } else {
    tsBabelOpts = { sourceMaps: 'inline' };
  }
  tsBabelOpts.presets = [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'safari >= 7'],
      },
      modules: false,
    }],
  ];
  return { tsContent, tsBabelOpts };
}
async function transformFile(filePath, argv) {
  if (isSourceMap(filePath)) {
    return cacheSourceMap.get(filePath);
  }
  filePath = ensureFilePath(filePath); // eslint-disable-line no-param-reassign
  const cache = cacheTransform.get(filePath);
  if (cache) {
    return cache;
  }
  let content = await readFile(filePath);
  let babelOpts = getBabelOpts(filePath, argv);
  if (isTypescript(filePath)) {
    const { tsContent, tsBabelOpts } = transformTypescript(filePath, babelOpts.sourceRoot, content, argv); // eslint-disable-line
    content = tsContent;
    babelOpts = Object.assign({}, babelOpts, tsBabelOpts);
  }
  const { code, map } = babel.transform(content, babelOpts);

  if (map) {
    const key = getPathWithExt(filePath, 'js.map');
    cacheSourceMap.set(key, map);
  }
  cacheTransform.set(filePath, code);
  return code;
}

module.exports = function transform(argv) {
  return async (ctx, next) => {
    await next();
    let { url } = ctx;
    // We need to remove the leading slash else it will be excluded by default
    if (ctx.url.length && ctx.url.startsWith('/')) {
      url = ctx.url.substring(1);
    }
    const shouldInstrument = argv.coverage && argv.instrument && argv.instrument.testExclude.shouldInstrument(url); //eslint-disable-line
    const shouldTransform = argv.transform && argv.transform.testExclude.shouldInstrument(url);

    if (shouldInstrument || shouldTransform) {
      const { response } = ctx;
      response.body = await transformFile(url, argv);
    }
  };
};
