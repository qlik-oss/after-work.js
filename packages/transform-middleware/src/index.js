const { transformFile } = require('@after-work.js/transform');

module.exports = function transform(argv) {
  return (req, res, next) => {
    next();
    let { url } = req;
    // We need to remove the leading slash else it will be excluded by default
    if (req.url.length && req.url.startsWith('/')) {
      url = req.url.substring(1);
    }
    const shouldInstrument = argv.coverage && argv.shouldInstrument(url);
    const shouldTransform = argv.shouldTransform(url);
    if (shouldInstrument || shouldTransform) {
      const file = transformFile(url, argv);
      res.send(file);
    }
  };
};
