/* globals document, Element, window */
const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const util = require('util');
const mkdirp = require('mkdirp');

function getBoundingClientRect(selector, cb) {
  /* eslint-disable */
  var elem = document.querySelector(selector);
  if (!(elem instanceof Element)) {
    throw new Error('Invalid selector:', selector);
  }

  var rect = elem.getBoundingClientRect();
  var ratio = window.devicePixelRatio;
  cb({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    ratio: ratio
  });
  /* eslint-enable */
}

const utils = {
  getBoundingClientRect,
  getBrowserName(browser) {
    return browser.getCapabilities();
  },
  fileExists(filePath) {
    return new Promise((resolve) => {
      fs.lstat(filePath, (err) => {
        resolve(!err);
      });
    });
  },
  removeFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  removeFiles(...files) {
    return Promise.all(files.map(file => this.removeFile(file)));
  },
  writeImage(img, filePath) {
    return new Promise((resolve, reject) => {
      img.write(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  compare(baseline, regressionImg, tolerance) {
    return jimp.read(baseline).then((baselineImg) => {
      const distance = jimp.distance(baselineImg, regressionImg);
      const diff = jimp.diff(baselineImg, regressionImg);
      return {
        diffImg: diff.image,
        isEqual: distance <= Math.max(0.02, tolerance) && diff.percent <= tolerance,
        equality: `distance: ${distance}, percent: ${diff.percent}`,
      };
    });
  },
  takeImageOf(browser, {
    selector = 'body', offsetX = 0, offsetY = 0, offsetWidth = 0, offsetHeight = 0,
  } = {}) {
    return browser.executeAsyncScript(getBoundingClientRect, selector).then((rect) => {
      rect.left += offsetX;
      rect.top += offsetY;
      rect.width += offsetWidth;
      rect.height += offsetHeight;
      return browser.takeScreenshot().then(base64 => jimp.read(new Buffer(base64, 'base64')).then((img) => { // eslint-disable-line no-buffer-constructor
        if (rect.ratio > 1) {
          img.scale(1 / rect.ratio);
        }
        img.crop(rect.left, rect.top, rect.width, rect.height);
        return {
          rect,
          img,
        };
      }));
    }).then(meta => this.getBrowserName(browser).then(caps => ({
      img: meta.img,
      rect: meta.rect,
      browserName: caps.get('browserName').replace(' ', '-'),
      artifactsPath: browser.artifactsPath,
      platform: caps.get('platform').replace(/ /g, '-').toLowerCase(),
    })));
  },
  matchImageOf(id, folder = '', tolerance = 0.002) {
    const promise = this._obj.then ? this._obj : Promise.resolve(this._obj); // eslint-disable-line
    return promise.then((meta) => {
      const imageName = util.format('%s-%s-%s.png', id, meta.platform, meta.browserName);

      mkdirp.sync(path.resolve(meta.artifactsPath, 'baseline', folder));
      mkdirp.sync(path.resolve(meta.artifactsPath, 'regression', folder));
      mkdirp.sync(path.resolve(meta.artifactsPath, 'diff', folder));

      const baseline = path.resolve(meta.artifactsPath, 'baseline', folder, imageName);
      const regression = path.resolve(meta.artifactsPath, 'regression', folder, imageName);
      const diff = path.resolve(meta.artifactsPath, 'diff', folder, imageName);

      // Injecting images into assert
      const expected = {
        baseline: path.join('baseline', folder, imageName).replace(/\\/g, '/'),
        diff: path.join('diff', folder, imageName).replace(/\\/g, '/'),
        regression: path.join('regression', folder, imageName).replace(/\\/g, '/'),
      };

      const actual = {};

      return utils.fileExists(baseline).then((exists) => {
        if (!exists) {
          return utils.writeImage(meta.img, baseline).then(() => {
            this.assert(
              false,
              `No baseline found! New baseline generated at ${`${meta.artifactsPath}/${expected.baseline}`}`,
              `No baseline found! New baseline generated at ${`${meta.artifactsPath}/${expected.baseline}`}`,
              JSON.stringify(expected),
              actual
            );
          });
        }
        return utils.compare(baseline, meta.img, tolerance).then((comparison) => {
          if (comparison.isEqual) {
            return comparison;
          }
          return Promise.all([
            utils.writeImage(meta.img, regression),
            utils.writeImage(comparison.diffImg, diff)]).then(() => {
            this.assert(
              comparison.isEqual === true,
              `expected ${id} equality to be less than ${tolerance}, but was ${comparison.equality}`,
              `expected ${id} equality to be greater than ${tolerance}, but was ${comparison.equality}`,
              JSON.stringify(expected),
              actual
            );
            return comparison;
          });
        });
      });
    });
  },
};

module.exports = utils;
