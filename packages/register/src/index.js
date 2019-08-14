const path = require('path');
const fs = require('fs');
const { addHook } = require('pirates');
const sourceMapSupport = require('source-map-support');
const {
  transformFile,
  getTransform,
} = require('@after-work.js/transform');
const minimatch = require('minimatch');
const mod = require('module');
const requireFromString = require('require-from-string');
const utils = require('@after-work.js/utils');

const originLoader = mod._load;
let removeCompileHook = () => {};
let removeLoadHook = () => {};

function compileHook(argv, code, filename, virtualMock = false) {
  const matchedMocks = new Set(aw.usedMocks.values());
  if (matchedMocks.has(filename)) {
    virtualMock = true;
  }

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

function hookedLoader(options, request, parent, isMain) {
  let filename;
  try {
    filename = mod._resolveFilename(request, parent);
  } catch (err) {
    filename = request;
  }
  // 1. Explicit mocks in modules e.g aw.mock(...)
  // 2. Global config mocks from aw.config.js
  for (const [key, [value, injectReact = false]] of aw.mocks) {
    // Try full match first exclude relative
    if (request && request.length && request[0] !== '.' && request === key) {
      aw.usedMocks.set(key, filename);
      return compileMock(options, filename, value, injectReact);
    }
    if (minimatch(filename, key)) {
      aw.usedMocks.set(key, filename);
      return compileMock(options, filename, value, injectReact);
    }
  }
  for (const [key, [value, injectReact = false]] of aw.globalMocks) {
    if (minimatch(filename, key)) {
      aw.usedGlobalMocks.set(key, filename);
      return compileMock(options, filename, value, injectReact);
    }
  }
  return originLoader(request, parent, isMain);
}

function addLoadHook(options) {
  const loadHook = hookedLoader.bind(null, options);
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
  constructor(srcFiles, testFiles, warn, onStart, onFinished, mocks = []) {
    this.srcFiles = srcFiles;
    this.testFiles = testFiles;
    this.mocks = new Map();
    this.usedMocks = new Map();
    this.globalMocks = new Map();
    this.usedGlobalMocks = new Map();
    mocks.forEach(([key, value]) => this.globalMocks.set(key, [value, false]));
    this.warn = warn;
    onStart(() => {
      this.usedMocks.clear();
      this.usedGlobalMocks.clear();
    });
    onFinished(() => {
      const globalMocksKeys = [...this.globalMocks.keys()];
      const usedGlobalMocksKeys = [...this.usedGlobalMocks.keys()];
      const unusedGlobalMocksKeys = globalMocksKeys.filter(
        k => !usedGlobalMocksKeys.includes(k),
      );
      for (const key of unusedGlobalMocksKeys) {
        const [value] = this.globalMocks.get(key);
        const warning = () => console.error(
          `\u001b[33mCouldn't match global mock with pattern:\u001b[0m \u001b[31m${key}\u001b[0m \u001b[33mand value:\u001b[0m \u001b[34m${value}\u001b[0m\n\u001b[90mat (Check your config file)\u001b[0m`,
        );
        this.warn(warning);
      }
    });
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
    const [filename, , , c] = utils.getCurrentFilenameStackInfo(this.testFiles);
    const excludeLibs = f => f.indexOf('node_modules') > -1;
    const mods = reqs.map(r => {
      const p = require.resolve(path.resolve(path.dirname(filename), r));
      const deps = utils
        .getAllDependencies(this.srcFiles, p)
        .filter(f => this.testFiles.indexOf(f) === -1 && !excludeLibs(f));
      deps.forEach(d => utils.safeDeleteCache(d));
      utils.safeDeleteCache(p);
      const m = require(p);
      deps.forEach(d => utils.safeDeleteCache(d));
      return m;
    });

    const mocksKeys = [...this.mocks.keys()];
    const usedMocksKeys = [...this.usedMocks.keys()];
    const unusedMocksKeys = mocksKeys.filter(k => !usedMocksKeys.includes(k));
    for (const key of unusedMocksKeys) {
      const [value] = this.mocks.get(key);
      const warning = () => console.error(
        `\u001b[33mCouldn't match local mock with pattern:\u001b[0m \u001b[31m${key}\u001b[0m \u001b[33mand value:\u001b[0m \u001b[34m${value}\u001b[0m\n\u001b[90mat (${c})\u001b[0m`,
      );
      this.warn(warning);
    }
    this.mocks.clear();
    return mods;
  }
}

module.exports = function register(
  options = {},
  srcFiles,
  testFiles,
  warn = () => {},
  onStart = () => {},
  onFinished = () => {},
) {
  global.aw = new AW(
    srcFiles,
    testFiles,
    warn,
    onStart,
    onFinished,
    options.mocks,
  );
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
