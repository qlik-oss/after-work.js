/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const fs = require('fs');
const {
  isSourceMap,
  isTypescript,
  ensureFilePath,
} = require('@after-work.js/utils');
const FileCache = require('./file-cache');

const fileCache = new FileCache();

function getBabelOpts(filename, argv) {
  const {
    options: { sourceRoot, only, ignore } = {},
    babelPluginIstanbul,
  } = argv.babel;
  const virtualMock = !!argv.virtualMock;
  const addCoverage = virtualMock === false;
  const plugins = addCoverage ? [[babelPluginIstanbul, argv.nyc]] : [];
  const sourceMaps = 'both';
  const retainLines = true;
  return {
    filename,
    sourceRoot,
    plugins,
    only,
    ignore,
    sourceMaps,
    retainLines,
  };
}

function transformTypescript(filePath, sourceRoot, tsContent, argv) {
  const {
    babel: { typescript },
  } = argv;
  const {
    transform: {
      typescript: { compilerOptions = {}, babelOptions = {} } = {},
    } = {},
  } = argv;
  const fileName = filePath;
  compilerOptions.sourceRoot = sourceRoot;
  compilerOptions.inlineSources = true;
  if (!compilerOptions.sourceMap && !compilerOptions.inlineSourceMap) {
    compilerOptions.inlineSourceMap = true;
  }
  if (!compilerOptions.module) {
    compilerOptions.module = 'esnext';
  }
  const transpileOpts = { fileName, compilerOptions };
  const res = typescript.transpileModule(tsContent, transpileOpts);
  tsContent = res.outputText;
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
    const cachedTransform = fileCache.getSync(
      filename.split('.map').join(''),
      argv,
    );
    return cachedTransform.map;
  }
  if (!content) {
    filename = ensureFilePath(filename);
    const cachedTransform = fileCache.getSync(filename, argv);
    if (cachedTransform) {
      return cachedTransform.code;
    }
    content = fs.readFileSync(filename, 'utf8');
  }
  const cachedTransform = fileCache.getSync(filename, argv);
  if (cachedTransform) {
    return cachedTransform.code;
  }
  let babelOpts = getBabelOpts(filename, argv);
  if (isTypescript(filename)) {
    const { tsContent, tsBabelOpts } = transformTypescript(
      filename,
      babelOpts.sourceRoot,
      content,
      argv,
    );
    content = tsContent;
    babelOpts = Object.assign({}, babelOpts, tsBabelOpts);
  }
  babelOpts.ast = false;
  const { babel } = argv.babel;
  const transform = babel.transform(content, babelOpts);
  if (!transform) {
    return content;
  }
  fileCache.setSync(filename, transform, argv);
  return transform.code;
}

const getTransform = filename => fileCache.getSync(filename, { ignoreCacheInvalidation: true });
const deleteTransform = filename => fileCache.transform.delete(filename);
const safeSaveCache = () => fileCache.saveSync();

module.exports = {
  getTransform,
  deleteTransform,
  safeSaveCache,
  transformFile,
};
