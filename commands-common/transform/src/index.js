/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const path = require('path');
const fs = require('fs');
const { isSourceMap, isTypescript, ensureFilePath } = require('@after-work.js/utils');
const FileCache = require('./file-cache');

const fileCache = new FileCache();

function getBabelOpts(filename, argv) {
  const { options, babelPluginIstanbul } = argv.babel;
  const sourceRoot = (options && options.sourceRoot) || argv.coverage ? path.dirname(filename) : undefined;// eslint-disable-line
  const addCoverage = argv.instrument.testExclude.shouldInstrument(filename);
  const plugins = addCoverage ?
    [[babelPluginIstanbul, {}]] :
    [];
  const sourceMaps = 'both';
  const retainLines = true;
  const { only, ignore } = argv.babelOptions || {};
  return { filename, sourceRoot, plugins, only, ignore, sourceMaps, retainLines };
}

function transformTypescript(filePath, sourceRoot, tsContent, argv) {
  const { tsc } = argv;
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
  let tsBabelOpts = {
    sourceMaps: 'both',
  };

  if (res.sourceMapText) {
    const inputSourceMap = JSON.parse(res.sourceMapText);
    tsBabelOpts = { inputSourceMap };
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
  const { babel } = argv.babel;
  const transform = babel.transform(content, babelOpts);
  fileCache.setSync(filename, transform, argv);
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
