module.exports = function getBoundingClientRect(selector, cb) {
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
    ratio: ratio,
  });
  /* eslint-enable */
};
