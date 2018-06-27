/* eslint class-methods-use-this: 0, no-restricted-syntax: 0, guard-for-in: 0, no-await-in-loop: 0, max-len: 0 */

const path = require('path');
const findCacheDir = require('find-cache-dir');
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

class FileCache {
  constructor() {
    this.cacheDir = findCacheDir({ name: '@after-work.js/transform', create: true });
    this.transform = new Map();
  }
  getCacheFilename(filename) {
    const hash = crypto.createHash('md5').update(filename).digest('hex');
    return path.join(this.cacheDir, `${hash}.json.gz`);
  }
  getCacheHash(filename, options) {
    const data = JSON.stringify({
      filename,
      options,
    });
    return crypto.createHash('md5').update(data).digest('hex');
  }
  getStringifiedValue(filename) {
    const value = this.transform.get(filename);
    const str = JSON.stringify(value, null, 2);
    return str;
  }
  setSync(filename, transformItem, options) {
    const {
      virtualMock,
      babelOptions,
      instrument,
      transform,
    } = options;
    transformItem.hash = this.getCacheHash(filename, { ...babelOptions, ...instrument, ...transform }); // eslint-disable-line no-param-reassign
    if (!virtualMock) {
      transformItem.mtime = +fs.statSync(filename).mtime; // eslint-disable-line no-param-reassign
    }
    this.transform.set(filename, transformItem);
    this.safeSaveCacheSync(filename);
  }
  getSync(filename, options = {}) {
    const {
      ignoreCacheInvalidation = false,
      fileCache = true,
      virtualMock = false,
      babelOptions,
      instrument,
      transform,
    } = options;
    const value = this.safeLoadCacheSync(this.getCacheFilename(filename));
    this.transform.set(filename, value);
    if (!fileCache) {
      return null;
    }
    if (ignoreCacheInvalidation) {
      return value;
    }
    if (virtualMock) { // virtual mock always refresh
      return null;
    }
    if (value && value.mtime && value.mtime !== +fs.statSync(filename).mtime) {
      return null;
    }
    const hash = this.getCacheHash(filename, { ...babelOptions, ...instrument, ...transform });
    if (value && value.hash && value.hash !== hash) {
      return null;
    }
    return value;
  }
  safeLoadCacheSync(filename) {
    try {
      const gz = fs.readFileSync(filename);
      const str = zlib.gunzipSync(gz);
      return JSON.parse(str);
    } catch (err) {
      return null;
    }
  }
  safeSaveCacheSync(filename) {
    try {
      const str = this.getStringifiedValue(filename);
      const gz = zlib.gzipSync(str);
      fs.writeFileSync(this.getCacheFilename(filename), gz, 'utf8');
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
  }
}

module.exports = FileCache;
