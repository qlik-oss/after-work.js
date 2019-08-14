/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const fs = require('fs');
const {
  isSourceMap,
  isTypescript,
  ensureFilePath,
  createDebug,
  isTestFile,
} = require('@after-work.js/utils');
const FileCache = require('./file-cache');

const fileCache = new FileCache();
const debug = createDebug('transform');

function getBabelOpts(filename, argv) {
  const {
    options: { sourceRoot, only, ignore, plugins = [], presets = [] } = {},
    babelPluginIstanbul,
  } = argv.babel;
  const virtualMock = !!argv.virtualMock;
  const addCoverage = virtualMock === false && isTestFile(filename, argv) === false;
  const usePlugins = addCoverage
    ? [...plugins, [babelPluginIstanbul, argv.nyc]]
    : plugins;
  const sourceMaps = 'both';
  const retainLines = true;
  const opts = {
    filename,
    sourceRoot,
    presets,
    plugins: usePlugins,
    only,
    ignore,
    sourceMaps,
    retainLines,
  };
  debug('getBabelOpts', opts);
  return opts;
}

function transformTypescript(filePath, sourceRoot, tsContent, argv) {
  const {
    babel: { typescript },
    __isNodeRunner = false,
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
    compilerOptions.module = __isNodeRunner ? 'commonjs' : 'esnext';
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
  debug(':transformTypescript', tsContent, tsBabelOpts);
  return { tsContent, tsBabelOpts };
}
function transformFile(filename, argv, content = null) {
  debug(':transformFile');
  if (!content && isSourceMap(filename)) {
    const cachedTransform = fileCache.getSync(
      filename.split('.map').join(''),
      argv,
    );
    debug(':transformFile cached source map', cachedTransform);
    return cachedTransform.map;
  }
  if (!content) {
    filename = ensureFilePath(filename);
    if (!filename) {
      return null;
    }
    const cachedTransform = fileCache.getSync(filename, argv);
    if (cachedTransform) {
      debug(':transformFile cached transform', cachedTransform);
      return cachedTransform.code;
    }

    content = fs.readFileSync(filename, 'utf8');
  }
  const cachedTransform = fileCache.getSync(filename, argv);
  if (cachedTransform) {
    debug(':transformFile cached transform', cachedTransform);
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
    babelOpts = { ...babelOpts, ...tsBabelOpts };
  }
  babelOpts.ast = false;
  const { babel } = argv.babel;
  const transform = babel.transform(content, babelOpts);
  debug(':transformFile transform', transform);
  if (!transform) {
    debug(':transformFile transform null');
    return content;
  }
  fileCache.setSync(filename, transform, argv);
  return transform.code;
}

const getTransform = (filename) => fileCache.getSync(filename, { ignoreCacheInvalidation: true });
const deleteTransform = (filename) => fileCache.transform.delete(filename);
const safeSaveCache = () => fileCache.saveSync();

module.exports = {
  getTransform,
  deleteTransform,
  safeSaveCache,
  transformFile,
};
