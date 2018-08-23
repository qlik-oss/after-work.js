/* eslint max-len: 0, import/no-dynamic-require: 0, global-require: 0 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const importCwd = require('import-cwd');

const isCI = !!process.env.CI;

const utils = {
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
    if (isCI) {
      return;
    }
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
  },
  writeLine(msg) {
    if (isCI) {
      return;
    }
    this.clearLine();
    process.stdout.write(`${msg}`);
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
      opt.babelPluginIstanbul = importCwd(opt.babelPluginIstanbul).default;
    }
    if (typeof opt.typescript === 'string') {
      opt.typescript = importCwd.silent(opt.typescript);
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
  },
  safeRequireCache(f) {
    try {
      require(f);
      return require.cache[f];
    } catch (_) { } //eslint-disable-line
    return { children: [] };
  },
  matchDependency(found, testName) {
    let use = found;
    if (found.length > 1) {
      const matchName = found.filter(id => path.basename(id).split('.').shift() === testName);
      if (matchName.length === 1) {
        use = matchName;
      } else {
        use = found.splice(0, 1);
      }
    }
    return use;
  },
  getDependencies(files, file) {
    const name = path.basename(file).split('.').shift();
    const mod = this.safeRequireCache(file);
    const found = mod
      .children
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
};

module.exports = utils;
