const fs = require('fs');
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
        found = require(name); // eslint-disable-line
      } catch (err) {
        found = null;
      }
    }
    return found;
  },
  coerceBabel(opt) {
    if (opt.enable && opt.core && typeof opt.core === 'string') {
      opt.babel = importCwd(opt.core); // eslint-disable-line no-param-reassign
    } else if (opt.enable && !opt.core) {
      let core = utils.safeGetModule('@babel/core');
      if (!core) {
        core = utils.safeGetModule('babel-core');
        if (!core) {
          throw new Error('Can not get babel core module');
        }
      }
      opt.babel = core; // eslint-disable-line no-param-reassign
    }
    if (typeof opt.babelPluginIstanbul === 'string') {
      opt.babelPluginIstanbul = importCwd(opt.babelPluginIstanbul).default; // eslint-disable-line no-param-reassign, max-len
    }
    return opt;
  },
  coerceTsc(opt) {
    if (typeof opt === 'string') {
      return importCwd('typescript');
    }
    return opt;
  },
};

module.exports = utils;
