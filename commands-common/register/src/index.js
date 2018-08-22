/* eslint global-require: 0, import/no-dynamic-require: 0, class-methods-use-this: 0 */

const path = require('path');
const fs = require('fs');
const { addHook } = require('pirates');
const sourceMapSupport = require('source-map-support');
const { transformFile, getTransform, deleteTransform } = require('@after-work.js/transform');
const minimatch = require('minimatch');
const mod = require('module');
const requireFromString = require('require-from-string');
const utils = require('@after-work.js/utils');

const originLoader = mod._load; //eslint-disable-line
let removeCompileHook = () => { };
let removeLoadHook = () => { };

function compileHook(argv, code, filename, virtualMock = false) {
  if (!argv.babel.enable) {
    return code;
  }
  const sourceRoot = path.dirname(filename);
  const { babel, options } = argv.babel;
  const opts = new babel.OptionManager().init({
    ...options,
    filename,
    sourceRoot,
  });
  if (opts === null) {
    return code;
  }
  const newArgv = {
    ...argv,
    babel: {
      ...argv.babel,
      options: {
        ...opts,
      },
    },
    virtualMock,
  };
  return transformFile(filename, newArgv, code);
}

function compile(value, filename, options, injectReact) {
  let src;
  if (fs.existsSync(value)) {
    src = fs.readFileSync(value, 'utf8');
  } else {
    src = `${injectReact ? 'import React from "react";\n' : ''}export default ${value}`;
  }
  src = compileHook(options, src, filename, true);
  return requireFromString(src);
}

function hookedLoader(options, request, parent, isMain) {
  let filename;
  try {
    filename = mod._resolveFilename(request, parent); // eslint-disable-line
  } catch (err) {
    filename = request;
  }

  // Explicit mocks in modules e.g aw.mock(...)
  for (let [key, [value, injectReact]] of aw.mocks) { // eslint-disable-line
    if (minimatch(filename, key)) {
      if (value === undefined && fs.existsSync(filename)) {
        const src = fs.readFileSync(filename, 'utf8');
        value = `${JSON.stringify(src)}`;
      }
      return compile(value, filename, options, injectReact);
    }
  }

  // Global config mocks
  for (const item of options.mocks || []) { // eslint-disable-line
    let [key, value] = item; //eslint-disable-line
    if (minimatch(filename, key)) {
      if (value === undefined && fs.existsSync(filename)) {
        const src = fs.readFileSync(filename, 'utf8');
        value = `${JSON.stringify(src)}`;
      }
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

class AW {
  constructor(srcFiles, testFiles) {
    this.srcFiles = srcFiles;
    this.testFiles = testFiles;
    this.mocks = new Map();
  }

  canInjectReact() {
    try {
      require.resolve('react');
    } catch (_) {
      return false;
    }
    return true;
  }

  mock(mocks, reqs) {
    const injectReact = this.canInjectReact();
    mocks.forEach(([key, value]) => this.mocks.set(key, [value, injectReact]));
    const [filename] = utils.getCurrentFilenameStackInfo(this.testFiles);
    const deps = utils.getAllDependencies(this.srcFiles, filename);
    deps.forEach((d) => {
      utils.safeDeleteCache(d);
    });

    const mods = reqs.map((r) => {
      const p = require.resolve(path.resolve(path.dirname(filename), r));
      const m = require(p);
      return m.__esModule && m.default ? m.default : m; // eslint-disable-line no-underscore-dangle
    });

    mocks.forEach(([key]) => this.mocks.delete(key));
    deps.forEach((d) => {
      utils.safeDeleteCache(d);
      deleteTransform(d);
    });
    return mods;
  }
}

module.exports = function register(options = {}, srcFiles, testFiles) {
  global.aw = new AW(srcFiles, testFiles);
  installSourceMapSupport();
  removeCompileHook();
  removeLoadHook();
  const exts = [...new Set(options.extensions || []), '.js', '.ts', '.jsx', '.scss', '.less', '.css', '.html'];
  removeCompileHook = addHook(compileHook.bind(null, options), { exts });
  removeLoadHook = addLoadHook(options);
};
