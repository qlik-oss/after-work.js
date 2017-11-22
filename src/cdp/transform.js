/* eslint global-require: 0, import/no-dynamic-require: 0 */
const path = require('path');
const fs = require('fs');
const importCwd = require('import-cwd');

function tryRequire(name) {
  const found = importCwd.silent(name);
  if (!found) {
    return require(`${name}`);
  }
  return found;
}

const babel = tryRequire('babel-core');
const babelPluginIstanbul = tryRequire('babel-plugin-istanbul').default;
const tsc = tryRequire('typescript');
const virtualSourceMap = new Map();

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

function isSourceMap(f) {
  return !fs.existsSync(f) && f.endsWith('.map');
}
function isTypescript(f) {
  return f.endsWith('.ts');
}
function getPathWithExt(f, ext) {
  const parts = f.split('.');
  parts.pop();
  return `${parts.join('.')}.${ext}`;
}
function getBabelOpts(filePath, argv) {
  const sourceRoot = argv.coverage ? path.dirname(filePath) : null;
  const plugins = argv.coverage && argv.instrument.testExclude.shouldInstrument(filePath) ?
    [[babelPluginIstanbul, {}]] :
    [];
  return { filename: filePath, sourceRoot, plugins };
}
function ensureFilePath(js) {
  if (!fs.existsSync(js) && js.endsWith('.js')) {
    const ts = getPathWithExt(js, 'ts');
    if (!fs.existsSync(ts)) {
      throw new Error(`Can't find file ${js}`);
    }
    return ts;
  }
  return js;
}
function transformTypescript(filePath, sourceRoot, tsContent, argv) {
  // const compilerOptions = { sourceRoot, target: 'es5', module: 'amd', inlineSourceMap: true, inlineSources: true };
  const { transform: { typescript: { compilerOptions } } } = argv;
  compilerOptions.sourceRoot = sourceRoot;
  compilerOptions.inlineSources = true;
  if (!compilerOptions.sourceMap && !compilerOptions.inlineSourceMap) {
    compilerOptions.inlineSourceMap = true;
  }
  if (compilerOptions.module !== 'amd') {
    compilerOptions.module = 'amd';
  }
  if (!compilerOptions.target) {
    compilerOptions.target = 'es5';
  }
  const transpileOpts = { fileName: filePath, compilerOptions };
  const res = tsc.transpileModule(tsContent, transpileOpts);
  tsContent = res.outputText;
  let tsBabelOpts = {};
  if (res.sourceMapText) {
    const inputSourceMap = JSON.parse(res.sourceMapText);
    tsBabelOpts = { sourceMaps: true, inputSourceMap };
  } else {
    tsBabelOpts = { sourceMaps: 'inline' };
  }
  return { tsContent, tsBabelOpts };
}
async function transformFile(filePath, argv) {
  if (isSourceMap(filePath)) {
    return virtualSourceMap.get(filePath);
  }
  filePath = ensureFilePath(filePath);
  let content = await readFile(filePath);
  let babelOpts = getBabelOpts(filePath, argv);
  if (isTypescript(filePath)) {
    const { tsContent, tsBabelOpts } = transformTypescript(filePath, babelOpts.sourceRoot, content, argv);
    content = tsContent;
    babelOpts = Object.assign({}, babelOpts, tsBabelOpts);
  }
  const { code, map } = babel.transform(content, babelOpts);
  if (map) {
    const key = getPathWithExt(filePath, 'js.map');
    virtualSourceMap.set(key, map);
  }
  return code;
}

module.exports = function transform(argv) {
  return async (ctx, next) => {
    await next();
    // We need to remove the leading slash else it will be excluded by default
    const url = ctx.url.substring(1);
    if (argv.instrument.testExclude.shouldInstrument(url) ||
      argv.transform.testExclude.shouldInstrument(url)) {
      const { response } = ctx;
      response.body = await transformFile(url, argv);
    }
  };
};
