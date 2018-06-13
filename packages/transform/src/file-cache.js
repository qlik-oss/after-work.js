/* eslint class-methods-use-this: 0, no-restricted-syntax: 0, guard-for-in: 0, no-await-in-loop: 0, max-len: 0 */

const path = require('path');
const findCacheDir = require('find-cache-dir');
const util = require('util');
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const inflate = util.promisify(zlib.inflate);

class FileCache {
  constructor() {
    this.cacheDir = findCacheDir({ name: '@after-work.js/transform', create: true });
    this.transform = new Map();
    this.dirtyFiles = [];
  }
  getCacheFilename(filename) {
    const hash = crypto.createHash('md5').update(filename).digest('hex');
    return path.join(this.cacheDir, `${hash}.json.gz`);
  }
  getStringifiedValue(filename) {
    const value = this.transform.get(filename);
    const str = JSON.stringify(value, null, 2);
    return str;
  }
  async get(filename) {
    const value = await this.safeLoadCache(this.getCacheFilename(filename));
    this.transform.set(filename, value);
    return value;
  }
  setSync(filename, transform) {
    transform.mtime = +fs.statSync(filename).mtime; // eslint-disable-line no-param-reassign
    this.transform.set(filename, transform);
    this.dirtyFiles.push(filename);
  }
  getSync(filename) {
    const value = this.safeLoadCacheSync(this.getCacheFilename(filename));
    this.transform.set(filename, value);
    if (value && value.mtime !== +fs.statSync(filename).mtime) {
      return null;
    }
    return value;
  }
  async safeLoadCache(filename) {
    try {
      const gz = await readFile(filename);
      const str = await inflate(gz);
      return JSON.parse(str);
    } catch (err) {
      return null;
    }
  }
  safeLoadCacheSync(filename) {
    try {
      const gz = fs.readFileSync(filename);
      const str = zlib.inflateSync(gz);
      return JSON.parse(str);
    } catch (err) {
      return null;
    }
  }
  async safeSaveCache(filename) {
    try {
      const str = this.getStringifiedValue(filename);
      const gz = await zlib.deflate(str);
      await writeFile(filename, gz, 'utf8');
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
  }
  safeSaveCacheSync(filename) {
    try {
      const str = this.getStringifiedValue(filename);
      const gz = zlib.deflateSync(str);
      fs.writeFileSync(this.getCacheFilename(filename), gz, 'utf8');
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
  }
  async save() {
    for (const filename of this.transform.keys()) {
      await this.safeSaveCache(this.getCacheFilename(filename));
    }
  }
  saveSync() {
    this.dirtyFiles.forEach(filename => this.safeSaveCacheSync(filename));
  }
}

module.exports = FileCache;