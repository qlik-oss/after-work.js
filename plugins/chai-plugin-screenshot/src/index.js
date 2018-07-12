const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const util = require('util');
const mkdirp = require('mkdirp');

const plugin = {
  toImage(input) {
    const type = typeof input;
    const isObj = type === 'object';

    if (type === 'string') {
      // If string assume it's a path
      return jimp.read(input);
    }

    if (input instanceof jimp || (isObj && input.img instanceof jimp)) {
      // Input is an instance of Jimp
      return input.img ? Promise.resolve(input.img) : Promise.resolve(input);
    }

    if (isObj && (input.getBuffer || (input.img && input.img.getBuffer))) {
      // Input is a Jimp object where instanceof doesn't validate to true
      const fn = (resolve, reject) => (input.img ? input.img : input).getBuffer(
        jimp.AUTO,
        (e, b) => (e ? reject(e) : resolve(b)),
      );
      return new Promise(fn)
        .then(buffer => jimp.read(buffer));
    }

    if (Buffer.isBuffer(input)) {
      return jimp.read(input);
    }

    return Promise.reject(new Error(`Unable to convert to an image. Unsupported type '${type}'.`));
  },
  fileExists(filePath) {
    return new Promise((resolve) => {
      fs.lstat(filePath, err => resolve(!err));
    });
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
  compare(baselineImg, regressionImg, tolerance) {
    const distance = jimp.distance(baselineImg, regressionImg);
    const diff = jimp.diff(baselineImg, regressionImg);
    return Promise.resolve({
      diffImg: diff.image,
      isEqual: distance <= Math.max(0.02, tolerance) && diff.percent <= tolerance,
      equality: `distance: ${distance}, percent: ${diff.percent}`,
    });
  },
  // TODO do not make a breaking change with second and third argument?
  matchImageOf(id, {
    type = 'png',
    platform = '',
    browserName = '',
    folder = '',
    artifactsPath = '',
    tolerance = 0.002,
  } = {}) {
    const promise = this._obj.then ? this._obj : Promise.resolve(this._obj); // eslint-disable-line
    return promise.then((meta) => {
      const imageName = util.format('%s-%s-%s.png', id, meta.platform || platform, meta.browserName || browserName);

      const basePath = meta.artifactsPath || artifactsPath;
      mkdirp.sync(path.resolve(basePath, 'baseline', folder));
      mkdirp.sync(path.resolve(basePath, 'regression', folder));
      mkdirp.sync(path.resolve(basePath, 'diff', folder));

      const baselinePath = path.resolve(basePath, 'baseline', imageName);
      const regressionPath = path.resolve(basePath, 'regression', imageName);
      const diffPath = path.resolve(basePath, 'diff', imageName);

      // Injecting images into assert
      const expected = {
        baseline: path.join('baseline', imageName).replace(/\\/g, '/'),
        diff: path.join('diff', imageName).replace(/\\/g, '/'),
        regression: path.join('regression', imageName).replace(/\\/g, '/'),
      };
      const actual = {};
      const resolvedMeta = typeof meta === 'string' ? Buffer.from(meta, 'base64') : meta;

      return plugin.fileExists(baselinePath).then((exists) => {
        if (!exists) { // File doesnt exist
          return Promise.resolve(plugin.toImage(resolvedMeta))
            .then(regressionImg => plugin.writeImage(regressionImg, baselinePath)
              .then(() => {
                this.assert(
                  false,
                  `No baseline found! New baseline generated at ${`${basePath}/${expected.baseline}`}`,
                  `No baseline found! New baseline generated at ${`${basePath}/${expected.baseline}`}`,
                  JSON.stringify(expected),
                  actual,
                );
              }));
        }

        return Promise.all([
          plugin.toImage(baselinePath),
          plugin.toImage(resolvedMeta),
        ]).then((images) => {
          const baselineImg = images[0];
          const regressionImg = images[1];

          return plugin.compare(baselineImg, regressionImg, tolerance).then((comparison) => {
            if (comparison.isEqual) {
              return comparison;
            }
            return Promise.all([
              plugin.writeImage(regressionImg, regressionPath),
              plugin.writeImage(comparison.diffImg, diffPath),
            ]).then(() => {
              this.assert(
                comparison.isEqual === true,
                `expected ${id} equality to be less than ${tolerance}, but was ${comparison.equality}`,
                `expected ${id} equality to be greater than ${tolerance}, but was ${comparison.equality}`,
                JSON.stringify(expected),
                actual,
              );
              return comparison;
            });
          });
        });
      });
    });
  },
};

module.exports = plugin;
