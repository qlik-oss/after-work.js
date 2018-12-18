const NYC = require('nyc');
const testExclude = require('test-exclude');
const { transformFile } = require('@after-work.js/transform');
const {
  coerceBabel,
  DEFAULT_SRC_EXCLUDE_PATTERN,
  DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
} = require('@after-work.js/utils');

module.exports = function transformFiles(userArgv) {
  const babel = coerceBabel({
    enable: true,
    babelPluginIstanbul: 'babel-plugin-istanbul',
    ...(userArgv.babel || {}),
  });
  const transform = {
    include: userArgv.include || [],
    exclude: [
      ...(userArgv.exclude || []),
      ...DEFAULT_TRANSFORM_EXCLUDE_PATTERN,
    ],
  };
  const argv = {
    coverage: false,
    ...userArgv,
    babel,
    nyc: {
      include: [],
      exclude: DEFAULT_SRC_EXCLUDE_PATTERN,
      tempDirectory: './coverage/.nyc_output',
      reporter: ['lcov', 'text-summary'],
      reportDir: 'coverage',
      ...(userArgv.nyc || {}),
    },
    transform,
  };
  const nyc = new NYC(argv.nyc);
  const transformExclude = testExclude(argv.transform);
  argv.shouldInstrument = f => argv.coverage && nyc.exclude.shouldInstrument(f);
  argv.shouldTransform = f => transformExclude.shouldInstrument(f);

  return (req, res, next) => {
    let url = req.path;
    // We need to remove the leading slash else it will be excluded by default
    if (url.length && url.startsWith('/')) {
      url = url.substring(1);
    }
    const shouldInstrument = argv.coverage && argv.shouldInstrument(url);
    const shouldTransform = argv.shouldTransform(url);

    if (shouldInstrument || shouldTransform) {
      const file = transformFile(url, argv);
      if (file) {
        res.send(file);
        return;
      }
    }
    next();
  };
};
