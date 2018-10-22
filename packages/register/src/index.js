/* global aw */

const path = require('path');
const fs = require('fs');
const { addHook } = require('pirates');
const sourceMapSupport = require('source-map-support');
const {
  transformFile,
  getTransform,
  deleteTransform,
} = require('@after-work.js/transform');
const minimatch = require('minimatch');
const mod = require('module');
const requireFromString = require('require-from-string');
const utils = require('@after-work.js/utils');

const originLoader = mod._load;
let removeCompileHook = () => {};
let removeLoadHook = () => {};

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
    filename = value;
  } else {
    src = `${
      injectReact ? 'import React from "react";\n' : ''
    }export default ${value}`;
  }
  src = compileHook(options, src, filename, true);
  return requireFromString(src, filename);
}

function compileMock(options, filename, value, injectReact) {
  if (typeof value === 'function') {
    return value();
  }
  if (value === undefined && fs.existsSync(filename)) {
    const src = fs.readFileSync(filename, 'utf8');
    value = `${JSON.stringify(src)}`;
  }
  return compile(value, filename, options, injectReact);
}

function hookedLoader(options, configMocks, request, parent, isMain) {
  let filename;
  try {
    filename = mod._resolveFilename(request, parent);
  } catch (err) {
    filename = request;
  }

  const mocks = [...aw.mocks, ...configMocks];
  // 1. Explicit mocks in modules e.g aw.mock(...)
  // 2. Global config mocks from aw.config.js
  for (const [key, [value, injectReact = false]] of mocks) {
    if (minimatch(filename, key)) {
      return compileMock(options, filename, value, injectReact);
    }
  }
  return originLoader(request, parent, isMain);
}

function addLoadHook(options) {
  const configMocks = new Map();
  (options.mocks || []).forEach(([key, value]) => configMocks.set(key, [value, false]));
  const loadHook = hookedLoader.bind(null, options, configMocks);
  mod._load = loadHook;
  return () => {
    mod._load = originLoader;
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
    deps.forEach(d => utils.safeDeleteCache(d));
    Object.keys(require.cache)
      .filter(f => f !== filename && this.testFiles.indexOf(f) === -1)
      .forEach(f => utils.safeDeleteCache(f));

    const mods = reqs.map((r) => {
      const p = require.resolve(path.resolve(path.dirname(filename), r));
      return require(p);
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
  const exts = [
    ...new Set(options.extensions || []),
    '.js',
    '.ts',
    '.jsx',
    '.scss',
    '.less',
    '.css',
    '.html',
  ];
  removeCompileHook = addHook(compileHook.bind(null, options), { exts });
  removeLoadHook = addLoadHook(options);
};
