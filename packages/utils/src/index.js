/* eslint max-len: 0, import/no-dynamic-require: 0, global-require: 0 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const importCwd = require('import-cwd');
const debug = require('debug');
const globby = require('globby');
const minimatch = require('minimatch');

const pkg = importCwd('./package.json');
const findPkgs = g => globby.sync(`${g}/package.json`);
const reducePkgs = (acc, curr) => acc.concat(curr.map(c => c.slice(0, -13)));
const lerna = importCwd.silent('./lerna.json');
const workspaces = (pkg.workspaces || []).map(findPkgs).reduce(reducePkgs, []);
const lernaPackages = ((lerna && lerna.packages) || [])
  .map(findPkgs)
  .reduce(reducePkgs, []);
const packagesPath = [...workspaces, ...lernaPackages];
let packages = [];
const packagesMap = new Map();
packagesPath.forEach((root) => {
  const { name } = importCwd(`./${root}/package.json`);
  packages = [...packages, name];
  packagesMap.set(name, root);
});

const DEFAULT_TEST_EXT_PATTERN = '*.{spec,test}.{js,ts}';
const DEFAULT_TEST_GLOB_PATTERN = `**/${DEFAULT_TEST_EXT_PATTERN}`;

const DEFAULT_SRC_EXT_PATTERN = '*.{js,ts}';
const DEFAULT_SRC_GLOB_PATTERN = `**/${DEFAULT_SRC_EXT_PATTERN}`;
const DEFAULT_SRC_EXCLUDE_PATTERN = [
  '**/coverage/**',
  '**/scripts/**',
  '**/docs/**',
  '**/tools/**',
  '**/__*__/**',
  '**/test/**',
  '**/mocks/**',
  '**/dist/**',
  `**/${DEFAULT_TEST_EXT_PATTERN}`,
  '**/*.config.*',
];
const TEST_GLOB = [
  ...(packagesPath.length
    ? packagesPath.map(p => `${p}/${DEFAULT_TEST_GLOB_PATTERN}`)
    : [DEFAULT_TEST_GLOB_PATTERN]),
  '!**/node_modules/**',
  '!./node_modules/**',
];
const SRC_GLOB = [
  ...(packagesPath.length
    ? packagesPath.map(p => `${p}/${DEFAULT_SRC_GLOB_PATTERN}`)
    : [DEFAULT_SRC_GLOB_PATTERN]),
  '!**/node_modules/**',
  '!./node_modules/**',
];
const WATCH_GLOB = [...TEST_GLOB, ...SRC_GLOB];

const utils = {
  packages,
  packagesPath,
  packagesMap,
  workspaces,
  lernaPackages,
  DEFAULT_TEST_EXT_PATTERN,
  DEFAULT_TEST_GLOB_PATTERN,
  DEFAULT_SRC_GLOB_PATTERN,
  DEFAULT_SRC_EXCLUDE_PATTERN,
  TEST_GLOB,
  SRC_GLOB,
  WATCH_GLOB,
  isSourceMap(f) {
    return !fs.existsSync(f) && f.endsWith('.map');
  },
  isTypescript(f) {
    return f.endsWith('.ts');
  },
  getExt(f) {
    const parts = f.split('.');
    return parts.pop();
  },
  getPathWithExt(f, ext) {
    const parts = f.split('.');
    parts.pop();
    return `${parts.join('.')}.${ext}`;
  },
  ensureFilePath(js) {
    if (!fs.existsSync(js) && js.endsWith('.js')) {
      const ts = utils.getPathWithExt(js, 'ts');
      if (!fs.existsSync(ts)) {
        throw new Error(`Can't find file ${js}`);
      }
      return ts;
    }
    return js;
  },
  clearLine() {
    readline.clearLine(process.stderr, 0);
    readline.cursorTo(process.stderr, 0, null);
  },
  writeLine(prefix, msg) {
    this.clearLine();
    process.stderr.write(
      `${prefix} ${msg.length > 60 ? '...' : ''}${msg.slice(-59)}`,
    );
  },
  safeGetModule(name) {
    let found = importCwd.silent(name);
    if (!found) {
      try {
        found = require(name);
      } catch (err) {
        found = null;
      }
    }
    return found;
  },
  coerceBabel(opt) {
    if (opt.enable && opt.core && typeof opt.core === 'string') {
      opt.babel = importCwd(opt.core);
    } else if (opt.enable && !opt.core) {
      let core = utils.safeGetModule('@babel/core');
      if (!core) {
        core = utils.safeGetModule('babel-core');
        if (!core) {
          throw new Error('Can not get babel core module');
        }
      }
      opt.babel = core;
    }
    if (typeof opt.babelPluginIstanbul === 'string') {
      opt.babelPluginIstanbul = utils.safeGetModule(
        opt.babelPluginIstanbul,
      ).default;
    }
    if (typeof opt.typescript === 'string') {
      opt.typescript = utils.safeGetModule(opt.typescript);
    }
    return opt;
  },
  getCurrentFilenameStackInfo(testFiles) {
    // Magically figure out the current test from the stack trace (callsites not working with sourcemaps)
    const s = new Error().stack
      .split('\n')
      .slice(1)
      .map(c => c.split(/\(([^)]+)\)/)[1])
      .filter(c => c !== undefined)
      .map((c) => {
        const parts = c.split(':');
        const columnno = parts.pop();
        const lineno = parts.pop();
        const filename = path.resolve(parts.join(':'));
        return [filename, lineno, columnno];
      })
      .filter(([filename]) => testFiles.indexOf(filename) !== -1);
    if (!s.length) {
      throw new Error('Can not find test file');
    }
    return s.shift();
  },
  safeDeleteCache(f) {
    if (require.cache[f]) {
      delete require.cache[f];
    }
    if (require.cache[f] && require.cache[f].parent) {
      let i = require.cache[f].parent.children.length;
      while (i--) {
        if (require.cache[f].parent.children[i].id === f) {
          require.cache[f].parent.children.splice(i, 1);
        }
      }
    }
  },
  safeRequireCache(f) {
    try {
      require(f);
      return require.cache[f];
    } catch (_) {
      // console.error(_)
    }
    return { children: [] };
  },
  matchDependency(found, testName) {
    let use = found;
    if (found.length > 1) {
      const matchName = found.filter(
        id => path
          .basename(id)
          .split('.')
          .shift() === testName,
      );
      if (matchName.length === 1) {
        use = matchName;
      } else {
        use = found.splice(0, 1);
      }
    }
    return use;
  },
  getDependencies(files, file) {
    const name = path
      .basename(file)
      .split('.')
      .shift();
    const mod = this.safeRequireCache(file);
    const found = mod.children
      .filter(m => files.indexOf(m.id) !== -1)
      .map(m => m.id);
    return this.matchDependency(found, name);
  },
  getAllDependencies(files, file) {
    let all = [];
    const deps = this.getDependencies(files, file);
    const walk = (currentDeps) => {
      all = all.concat(currentDeps);
      currentDeps.forEach((d) => {
        const childDeps = this.getDependencies(files, d);
        walk(childDeps, files, d);
      });
    };
    walk(deps, files, file);
    return all;
  },
  createDebug(p) {
    return debug(`@after-work.js:${p}`);
  },
  filter(arr, initialValue) {
    return arr.reduce(
      (acc, curr) => acc.filter(file => minimatch(file, curr)),
      initialValue,
    );
  },
  isMatchingExtPattern(filePath, extPattern) {
    const base = path.basename(filePath);
    return minimatch(base, extPattern);
  },
};

module.exports = utils;
