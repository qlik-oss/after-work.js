/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const path = require('path');
const fs = require('fs');
const importCwd = require('import-cwd');
const { isSourceMap, isTypescript, ensureFilePath } = require('@after-work.js/file-utils');
const FileCache = require('./file-cache');

const fileCache = new FileCache();

const getModule = (name) => {
  let found = importCwd.silent(name);
  if (!found) {
    try {
      found = require(name);
    } catch (err) {
      found = null;
    }
  }
  return found;
};

let babel = getModule('babel-core');
if (!babel) {
  babel = getModule('@babel/core');
  if (!babel) {
    throw new Error('Can not find babel core');
  }
}

const babelPluginIstanbul = getModule('babel-plugin-istanbul').default;
const tsc = getModule('typescript');

function getBabelOpts(filename, argv) {
  const sourceRoot = (argv.babelOptions && argv.babelOptions.sourceRoot) || argv.coverage ? path.dirname(filename) : undefined;// eslint-disable-line
  const plugins = argv.coverage && argv.instrument.testExclude.shouldInstrument(filename) ?
    [[babelPluginIstanbul, {}]] :
    [];
  const { only, ignore } = argv.babelOptions || {};
  return { filename, sourceRoot, plugins, only, ignore };
}

function transformTypescript(filePath, sourceRoot, tsContent, argv) {
  const { transform: { typescript: { compilerOptions, babelOptions } } } = argv;
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
  tsBabelOpts = Object.assign(babelOptions, tsBabelOpts);
  return { tsContent, tsBabelOpts };
}
function transformFile(filename, argv, content = null) {
  if (!content && isSourceMap(filename)) {
    const cachedTransform = fileCache.getSync(filename.split('.map').join(''));
    return cachedTransform.map;
  }
  if (!content) {
    filename = ensureFilePath(filename); // eslint-disable-line no-param-reassign
    const cachedTransform = fileCache.getSync(filename);
    if (cachedTransform) {
      return cachedTransform.code;
    }
    content = fs.readFileSync(filename, 'utf8'); // eslint-disable-line no-param-reassign
  }
  const cachedTransform = fileCache.getSync(filename);
  if (cachedTransform) {
    return cachedTransform.code;
  }
  let babelOpts = getBabelOpts(filename, argv);
  if (isTypescript(filename)) {
    const { tsContent, tsBabelOpts } = transformTypescript(filename, babelOpts.sourceRoot, content, argv); // eslint-disable-line
    content = tsContent; // eslint-disable-line no-param-reassign
    babelOpts = Object.assign({}, babelOpts, tsBabelOpts);
  }
  babelOpts.ast = false;
  const transform = babel.transform(content, babelOpts);
  fileCache.setSync(filename, transform);
  return transform.code;
}

const getTransform = filename => fileCache.getSync(filename);
const deleteTransform = filename => fileCache.transform.delete(filename);
const safeSaveCache = () => fileCache.saveSync();

module.exports = {
  getTransform,
  deleteTransform,
  safeSaveCache,
  transformFile,
};
