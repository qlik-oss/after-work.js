const transformFile = require('@after-work.js/transform');

module.exports = function transform(argv) {
  return async (ctx, next) => {
    await next();
    let { url } = ctx;
    // We need to remove the leading slash else it will be excluded by default
    if (ctx.url.length && ctx.url.startsWith('/')) {
      url = ctx.url.substring(1);
    }
    const shouldInstrument = argv.coverage && argv.instrument && argv.instrument.testExclude.shouldInstrument(url); //eslint-disable-line
    const shouldTransform = argv.transform && argv.transform.testExclude.shouldInstrument(url);

    if (shouldInstrument || shouldTransform) {
      const { response } = ctx;
      response.body = await transformFile(url, argv);
    }
  };
};
