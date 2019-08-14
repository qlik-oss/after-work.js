/* eslint max-len: 0, import/no-dynamic-require: 0, global-require: 0 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const importCwd = require('import-cwd');
const debug = require('debug');
const globby = require('globby');
const minimatch = require('minimatch');

const isCI = !!process.env.CI;

const pkg = importCwd('./package.json');
const findPkgs = (g) => globby.sync(`${g}/package.json`);
const reducePkgs = (acc, curr) => acc.concat(curr.map((c) => c.slice(0, -13)));
const lerna = importCwd.silent('./lerna.json');
const workspaces = (pkg.workspaces || []).map(findPkgs).reduce(reducePkgs, []);
const lernaPackages = ((lerna && lerna.packages) || [])
  .map(findPkgs)
  .reduce(reducePkgs, []);
const packagesPath = [...workspaces, ...lernaPackages];

const DEFAULT_TEST_EXT_PATTERN = '*.{spec,test}.{js,jsx,ts,tsx}';
const DEFAULT_TEST_GLOB_PATTERN = `**/${DEFAULT_TEST_EXT_PATTERN}`;

const DEFAULT_SRC_EXT_PATTERN = '*.{js,ts,jsx,tsx}';
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
  DEFAULT_TEST_EXT_PATTERN,
  '**/*.config.*',
];

const DEFAULT_NEGATED_SRC_EXCLUDE_PATTERN = DEFAULT_SRC_EXCLUDE_PATTERN.reduce(
  (acc, curr) => [...acc, `!**/${curr}/**`, `!./${curr}/**`],
  [],
);

const getPackages = ({ testExt, srcExt }) => {
  const packagesMap = new Map();

  packagesPath.forEach((root) => {
    const { name } = importCwd(`./${root}/package.json`);
    const hasTests = globby.sync(`${root}/**/${testExt}`).length > 0;
    const testGlob = [`${root}/**/${testExt}`];
    const srcGlob = [`${root}/src/**/${srcExt}`];
    packagesMap.set(name, {
      root,
      hasTests,
      testGlob,
      srcGlob,
    });
  });
  return packagesMap;
};

const excludeGlob = ['!**/node_modules/**', '!./node_modules/**'];

const getTestGlob = (argv) => {
  const { testExt, scope } = argv;
  const packagesMap = getPackages(argv);
  let includeGlob = [`**/${testExt}`];
  const pkgs = scope.length > 0 ? scope : [...packagesMap.keys()];
  if (pkgs.length > 0) {
    includeGlob = pkgs.reduce((acc, s) => {
      const { testGlob } = packagesMap.get(s);
      return [...acc, ...testGlob];
    }, []);
  }
  return [...includeGlob, ...excludeGlob];
};

const TEST_GLOB = getTestGlob({ testExt: DEFAULT_TEST_EXT_PATTERN, scope: [] });

const getSrcGlob = (argv) => {
  const { srcExt, scope } = argv;
  const packagesMap = getPackages(argv);
  let includeGlob = [`src/**/${srcExt}`];
  const pkgs = scope.length > 0 ? scope : [...packagesMap.keys()];
  if (pkgs.length > 0) {
    includeGlob = pkgs.reduce((acc, s) => {
      const { srcGlob } = packagesMap.get(s);
      return [...acc, ...srcGlob];
    }, []);
  }
  return [...includeGlob, ...excludeGlob];
};

const SRC_GLOB = getSrcGlob({ srcExt: DEFAULT_SRC_EXT_PATTERN, scope: [] });

const WATCH_GLOB = [...TEST_GLOB, ...SRC_GLOB];

const DEFAULT_TRANSFORM_EXCLUDE_PATTERN = [
  '**/node_modules/**',
  './node_modules/**',
  '**/scripts/**',
  '**/dist/**',
  '**/docs/**',
  '**/coverage/**',
  '**/external/**',
  '**/autogenerated/**',
  '**/*.{html,css,json,txt,ttf,woff,svg,ico}',
  '**/*require*.js',
  '**/*sinon*.js',
  '**/*chai*.js',
];
const DEFAULT_INSTRUMENT_EXCLUDE_PATTERN = [
  ...DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
  '**/test/**',
  '**/__tests__/**',
  '**/mocks/**',
  '**/__mocks__/**',
  DEFAULT_TEST_EXT_PATTERN,
  DEFAULT_TEST_GLOB_PATTERN,
];
const DEFAULT_CONFIGS = `{${[
  'aw',
  'ava',
  'babel',
  'jest',
  'nyc',
  'rollup',
  'webpack',
].join()}}.config.js`;

const getInstrumentExcludePattern = ({
  testExt = DEFAULT_TEST_EXT_PATTERN,
}) => [
  ...DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
  '**/test/**',
  '**/__tests__/**',
  '**/mocks/**',
  '**/__mocks__/**',
  `**/${DEFAULT_CONFIGS}`,
  DEFAULT_CONFIGS,
  `**/${testExt}`,
  testExt,
];

const addDefaults = (argv) => {
  // Re-evaluate if it's the default values e.g `testExt` or `srcExt` could be changed
  if (argv.glob === TEST_GLOB) {
    argv.glob = getTestGlob(argv);
  }
  if (argv.src === SRC_GLOB) {
    argv.src = getSrcGlob(argv);
  }
  if (argv.watchGlob === WATCH_GLOB) {
    argv.watchGlob = [...argv.glob, ...argv.src];
  }
  argv.nyc.exclude = [
    ...argv.nyc.exclude,
    ...getInstrumentExcludePattern(argv),
  ];
};

const safeGetModule = (name) => {
  let found = importCwd.silent(name);
  if (!found) {
    try {
      found = require(name);
    } catch (err) {
      found = null;
    }
  }
  return found;
};

const utils = {
  addDefaults,
  getPackages,
  getInstrumentExcludePattern,
  packagesPath,
  workspaces,
  lernaPackages,
  TEST_GLOB,
  SRC_GLOB,
  WATCH_GLOB,
  DEFAULT_TEST_EXT_PATTERN,
  DEFAULT_TEST_GLOB_PATTERN,
  DEFAULT_SRC_EXT_PATTERN,
  DEFAULT_SRC_GLOB_PATTERN,
  DEFAULT_SRC_EXCLUDE_PATTERN,
  DEFAULT_NEGATED_SRC_EXCLUDE_PATTERN,
  DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
  DEFAULT_INSTRUMENT_EXCLUDE_PATTERN,
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
    const exists = fs.existsSync(js);
    if (!exists && js.endsWith('.js')) {
      const ts = utils.getPathWithExt(js, 'ts');
      if (!fs.existsSync(ts)) {
        return '';
      }
      return ts;
    }
    return exists ? js : '';
  },
  clearLine() {
    if (isCI) {
      return;
    }
    readline.clearLine(process.stderr, 0);
    readline.cursorTo(process.stderr, 0, null);
  },
  writeLine(prefix, msg) {
    if (isCI) {
      return;
    }
    this.clearLine();
    process.stderr.write(
      `${prefix} ${msg.length > 60 ? '...' : ''}${msg.slice(-59)}`,
    );
  },
  coerceBabel(opt) {
    if (opt.enable && opt.core && typeof opt.core === 'string') {
      opt.babel = importCwd(opt.core);
    } else if (opt.enable && !opt.core) {
      let core = safeGetModule('@babel/core');
      if (!core) {
        core = safeGetModule('babel-core');
        if (!core) {
          throw new Error('Can not get babel core module');
        }
      }
      opt.babel = core;
    }
    if (opt.enable && typeof opt.babelPluginIstanbul === 'string') {
      const babelPluginIstanbul = safeGetModule(opt.babelPluginIstanbul);
      opt.babelPluginIstanbul = babelPluginIstanbul
        ? babelPluginIstanbul.default
        : null;
    }
    if (opt.enable && typeof opt.typescript === 'string') {
      opt.typescript = safeGetModule(opt.typescript);
    }
    return opt;
  },
  getCurrentFilenameStackInfo(testFiles) {
    // Magically figure out the current test from the stack trace (callsites not working with sourcemaps)
    const s = new Error().stack
      .split('\n')
      .slice(1)
      .map((c) => c.split(/\(([^)]+)\)/)[1])
      .filter((c) => c !== undefined)
      .map((c) => {
        const parts = c.split(':');
        const columnno = parts.pop();
        const lineno = parts.pop();
        const filename = path.resolve(parts.join(':'));
        return [filename, lineno, columnno, c];
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
  },
  safeRequireCache(f) {
    try {
      require(f);
      return require.cache[f];
      // eslint-disable-next-line no-empty
    } catch (_) {}
    return undefined;
  },
  matchDependency(found, testName) {
    let use = found;
    if (found.length > 1) {
      const matchName = found.filter(
        (id) => path
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
    if (typeof mod === 'undefined') {
      return [];
    }
    const found = mod.children
      .filter((m) => files.indexOf(m.id) !== -1)
      .map((m) => m.id);
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
      (acc, curr) => acc.filter((file) => minimatch(file, curr)),
      initialValue,
    );
  },
  isMatchingExtPattern(filePath, extPattern) {
    const base = path.basename(filePath);
    return minimatch(base, extPattern);
  },
  isTestFile(filePath, { testExt = DEFAULT_TEST_EXT_PATTERN }) {
    return utils.isMatchingExtPattern(filePath, testExt);
  },
  isSrcFile(
    filePath,
    { testExt = DEFAULT_TEST_EXT_PATTERN, srcExt = DEFAULT_SRC_EXT_PATTERN },
  ) {
    return (
      !utils.isTestFile(filePath, testExt)
      && utils.isMatchingExtPattern(filePath, srcExt)
    );
  },
};

module.exports = utils;
