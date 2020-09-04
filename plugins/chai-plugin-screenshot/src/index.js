const path = require("path");
const fs = require("fs");
const jimp = require("jimp");
const mkdirp = require("mkdirp");

function resolveArgs(opts, t) {
  const type = typeof opts;
  let folder = "";
  let artifactsPath = "";
  let tolerance = typeof t === "number" ? t : 0.002;

  if (type === "string") {
    folder = opts;
  } else if (type === "object") {
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
    const isObj = type === "object" && input !== null;

    if (type === "string") {
      // If string assume it's a path
      return jimp.read(input);
    }

    if (isObj) {
      if (input instanceof jimp || input.img instanceof jimp) {
        // Input is an instance of Jimp
        return input.img ? Promise.resolve(input.img) : Promise.resolve(input);
      }

      if (input.getBuffer || (input.img && input.img.getBuffer)) {
        // Input is a Jimp object where instanceof doesn't validate to true
        const fn = (resolve, reject) =>
          (input.img ? input.img : input).getBuffer(jimp.AUTO, (e, b) =>
            e ? reject(e) : resolve(b)
          );
        return new Promise(fn).then((buffer) => jimp.read(buffer));
      }
    }

    if (Buffer.isBuffer(input)) {
      return jimp.read(input);
    }

    return Promise.reject(
      new TypeError(`Unable to create image. Unsupported type '${type}'.`)
    );
  },
  fileExists(filePath) {
    return new Promise((resolve) => {
      fs.lstat(filePath, (err) => resolve(!err));
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
      isEqual:
        distance <= Math.max(0.02, tolerance) && diff.percent <= tolerance,
      equality: `distance: ${distance}, percent: ${diff.percent}`,
    });
  },
  /**
   * @param {string} id - Name of the image
   * @param {string|object} opts - Folder or options object
   * @param {number} t - Tolerance
   */
  matchImageOf(id, opts, t) {
    const { folder, artifactsPath, tolerance } = resolveArgs(opts, t);
    const promise = this._obj.then ? this._obj : Promise.resolve(this._obj);
    return promise.then((meta) => {
      // TODO takeImageOf is an after-work specific context. Should do a more generic solution.
      const isTakeImageOf =
        typeof meta === "object" && typeof meta.artifactsPath === "string";
      const imageName = isTakeImageOf
        ? `${id}-${meta.platform}-${meta.browserName}.png`
        : `${id}.png`;
      const basePath = isTakeImageOf ? meta.artifactsPath : artifactsPath;

      const baseline = path.resolve(basePath, "baseline", folder, imageName);
      const regression = path.resolve(
        basePath,
        "regression",
        folder,
        imageName
      );
      const diff = path.resolve(basePath, "diff", folder, imageName);
      const expected = JSON.stringify({
        baseline,
        diff,
        regression,
      });
      const actual = {};
      const resolvedMeta =
        typeof meta === "string" ? Buffer.from(meta, "base64") : meta;

      return plugin.fileExists(baseline).then((exists) => {
        if (!exists) {
          mkdirp.sync(path.parse(baseline).dir);

          return Promise.resolve(plugin.toImage(resolvedMeta)).then(
            (baselineImg) =>
              plugin.writeImage(baselineImg, baseline).then(() => {
                const errStr = `No baseline found! New baseline generated at ${path.join(
                  basePath,
                  "baseline",
                  folder,
                  imageName
                )}`;
                this.assert(false, errStr, errStr, expected, actual);
              })
          );
        }

        return Promise.all([
          plugin.toImage(baseline),
          plugin.toImage(resolvedMeta),
        ]).then((images) => {
          const baselineImg = images[0];
          const regressionImg = images[1];

          return plugin
            .compare(baselineImg, regressionImg, tolerance)
            .then((comparison) => {
              if (comparison.isEqual) {
                return comparison;
              }

              mkdirp.sync(path.parse(regression).dir);
              mkdirp.sync(path.parse(diff).dir);

              return Promise.all([
                plugin.writeImage(regressionImg, regression),
                plugin.writeImage(comparison.diffImg, diff),
              ]).then(() => {
                this.assert(
                  comparison.isEqual === true,
                  `expected ${id} equality to be less than ${tolerance}, but was ${comparison.equality}`,
                  `expected ${id} equality to be greater than ${tolerance}, but was ${comparison.equality}`,
                  expected,
                  actual
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
