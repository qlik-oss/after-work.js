/* eslint global-require: 0, import/no-dynamic-require: 0 */

const path = require('path');
const importCwd = require('import-cwd');
const { addHook } = require('pirates');
const sourceMapSupport = require('source-map-support');
const { transformFile, getTransform } = require('@after-work.js/transform');

let babel = null;
let removeHook = null;
let registeredOpts = null;
let cwd = null;
let ignore = null;
let only = null;

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

function hook(code, filename) {
  const sourceRoot = path.dirname(filename);
  const { babelOptions } = registeredOpts;
  const opts = new babel.OptionManager().init({
    ...babelOptions,
    filename,
    sourceRoot,
  });
  if (opts === null) {
    return code;
  }
  const argv = {
    ...registeredOpts,
    babelOptions: {
      ...opts,
      ignore,
      only,
    },
  };
  return transformFile(filename, argv, code);
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

const escapeRegExp = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

module.exports = function register(options = {}) {
  babel = getModule('babel-core');
  if (!babel) {
    babel = getModule('@babel/core');
    if (!babel) {
      throw new Error('Can not find babel core');
    }
  }
  installSourceMapSupport();
  if (removeHook) {
    removeHook();
  }
  registeredOpts = options;
  cwd = process.cwd();
  only = [
    new RegExp(`^${escapeRegExp(cwd)}`, 'i'),
  ];
  ignore = [
    /node_modules/,
  ];
  const exts = options.extensions || ['.js', '.ts'];
  removeHook = addHook(hook, { exts });
};
