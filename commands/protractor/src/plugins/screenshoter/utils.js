const fs = require("fs");
const jimp = require("jimp");
const getBoundingClientRect = require("./bbox");

const utils = {
  getBoundingClientRect,
  getBrowserName(browser) {
    return browser.getCapabilities();
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
    return Promise.all(files.map((file) => this.removeFile(file)));
  },
  takeImageOf(
    browser,
    {
      selector = "body",
      offsetX = 0,
      offsetY = 0,
      offsetWidth = 0,
      offsetHeight = 0,
    } = {}
  ) {
    return browser
      .executeAsyncScript(getBoundingClientRect, selector)
      .then((rect) => {
        rect.left += offsetX;
        rect.top += offsetY;
        rect.width += offsetWidth;
        rect.height += offsetHeight;
        return browser.takeScreenshot().then((base64) =>
          jimp.read(Buffer.from(base64, "base64")).then((img) => {
            // eslint-disable-line no-buffer-constructor
            if (rect.ratio > 1) {
              img.scale(1 / rect.ratio);
            }
            img.crop(rect.left, rect.top, rect.width, rect.height);
            return {
              rect,
              img,
            };
          })
        );
      })
      .then((meta) =>
        this.getBrowserName(browser).then((caps) => {
          const platform =
            caps.get("platform") || caps.get("platformName") || "unknown";
          return {
            img: meta.img,
            rect: meta.rect,
            browserName: caps.get("browserName").replace(" ", "-"),
            artifactsPath: browser.reporterInfo.artifactsPath,
            platform: platform.replace(/ /g, "-").toLowerCase(),
          };
        })
      );
  },
};

module.exports = utils;
