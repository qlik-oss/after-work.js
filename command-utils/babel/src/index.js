/* eslint global-require: 0, import/no-dynamic-require: 0 */

const path = require('path');
const fs = require('fs');
const importCwd = require('import-cwd');
const { addHook } = require('pirates');
const sourceMapSupport = require('source-map-support');
const { transformFile, getTransform } = require('@after-work.js/transform');
const minimatch = require('minimatch');
const mod = require('module');

const originLoader = mod._load; //eslint-disable-line
let babel = null;
let removeCompileHook = () => { };
let removeLoadHook = () => { };

function getModule(name) {
  let found = importCwd.silent(name);
  if (!found) {
    try {
      found = require(name);
    } catch (err) {
      found = null;
    }
  }
  return found;
}

function compileHook(options, code, filename, virtualMock = false) {
  const sourceRoot = path.dirname(filename);
  const { babelOptions } = options;
  const opts = new babel.OptionManager().init({
    ...babelOptions,
    filename,
    sourceRoot,
  });
  if (opts === null) {
    return code;
  }
  const argv = {
    ...options,
    babelOptions: {
      ...opts,
    },
    virtualMock,
  };
  if (/after-work.js\/*(commands|command-utils)\/*(cli|transform)/.test(filename)) {
    return code;
  }
  return transformFile(filename, argv, code);
}

function compile(value, filename, options) {
  const Module = module.constructor;
  const m = new Module();
  let src;
  let virtualMock = false;
  if (fs.existsSync(value)) {
    src = fs.readFileSync(value, 'utf8');
  } else {
    virtualMock = true;
    src = `export default ${value}`;
  }
  src = compileHook(options, src, filename, virtualMock);
  m._compile(src, filename); //eslint-disable-line
  return m.exports;
}

function hookedLoader(options, request, parent, isMain) {
  let filename;
  try {
    filename = mod._resolveFilename(request, parent); // eslint-disable-line
  } catch (err) {
    filename = request;
  }

  for (const item of options.mocks || []) { // eslint-disable-line
    const [key, value] = item;
    if (minimatch(filename, key)) {
      return compile(value, filename, options);
    }
  }
  return originLoader(request, parent, isMain);
}

function addLoadHook(options) {
  const loadHook = hookedLoader.bind(null, options);
  mod._load = loadHook; //eslint-disable-line
  return () => {
    mod._load = originLoader; //eslint-disable-line
  };
}

let sourceMapSupportInstalled = false;
function installSourceMapSupport() {
  if (sourceMapSupportInstalled) {
    return;
  }
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: 'node',
    retrieveSourceMap(filename) {
      const { map } = getTransform(filename) || {};
      if (map) {
        return {
          url: null,
          map,
        };
      }
      return null;
    },
  });
  sourceMapSupportInstalled = true;
}

module.exports = function register(options = {}) {
  babel = getModule('@babel/core');
  if (!babel) {
    babel = getModule('babel-core');
    if (!babel) {
      throw new Error('Can not find babel core');
    }
  }
  installSourceMapSupport();
  removeCompileHook();
  removeLoadHook();
  const exts = [...new Set(options.extensions || []), '.js', '.ts', '.jsx', '.scss', '.less', '.css'];
  removeCompileHook = addHook(compileHook.bind(null, options), { exts });
  removeLoadHook = addLoadHook(options);
};
