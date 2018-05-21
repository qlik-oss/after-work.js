const fs = require('fs');

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
};

module.exports = utils;
