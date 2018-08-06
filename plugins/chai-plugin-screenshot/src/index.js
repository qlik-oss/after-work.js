const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const mkdirp = require('mkdirp');

function resolveArgs(opts, t) {
  const type = typeof opts;
  let folder = '';
  let artifactsPath = '';
  let tolerance = typeof t === 'number' ? t : 0.002;

  if (type === 'string') {
    folder = opts;
  } else if (type === 'object') {
    ({
      folder = folder,
      artifactsPath = artifactsPath,
      tolerance = tolerance,
    } = opts);
  }

  return {
    folder,
    artifactsPath,
    tolerance,
  };
}

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

    return Promise.reject(new Error(`Unable to create image. Unsupported type '${type}'.`));
  },
  fileExists(filePath) {
    return new Promise((resolve) => {
      fs.lstat(filePath, err => resolve(!err));
    });
  },
  writeImage(img, filePath) {
    mkdirp.sync(path.parse(filePath).dir);

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
  /**
   * @param {string} id - Name of the image
   * @param {string|object} opts - Folder or options object
   * @param {number} t - Tolerance
   */
  matchImageOf(id, opts, t) {
    const {
      folder,
      artifactsPath,
      tolerance,
    } = resolveArgs(opts, t);
    const promise = this._obj.then ? this._obj : Promise.resolve(this._obj); // eslint-disable-line
    return promise.then((meta) => {
      // TODO takeImageOf is an after-work specific context. Should do a more generic solution.
      const isTakeImageOf = typeof meta === 'object' && typeof meta.artifactsPath === 'string';
      const imageName = isTakeImageOf ? `${id}-${meta.platform}-${meta.browserName}.png` : `${id}.png`;
      const basePath = isTakeImageOf ? meta.artifactsPath : artifactsPath;

      const baselinePath = path.resolve(basePath, 'baseline', folder, imageName);
      const regressionPath = path.resolve(basePath, 'regression', folder, imageName);
      const diffPath = path.resolve(basePath, 'diff', folder, imageName);

      const resolvedMeta = typeof meta === 'string' ? Buffer.from(meta, 'base64') : meta;

      return plugin.fileExists(baselinePath).then((exists) => {
        if (!exists) { // File doesnt exist
          return Promise.resolve(plugin.toImage(resolvedMeta))
            .then(regressionImg => plugin.writeImage(regressionImg, baselinePath)
              .then(() => {
                const errStr = `No baseline found! New baseline generated at ${path.join(basePath, 'baseline', folder, imageName)}`;
                this.assert(
                  false,
                  errStr,
                  errStr,
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
