const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const importCwd = require('import-cwd');
const NYC = require('nyc');
const { transformFile } = require('@after-work.js/transform');
const utils = require('@after-work.js/utils');
const testExclude = require('test-exclude');
const options = require('./options');

const getYargsOptions = userOptions => yargs
  .options(options)
  .config('config', (configPath) => {
    if (configPath === null) {
      return {};
    }
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config ${configPath} not found`);
    }
    let config = {};
    const foundConfig = require(configPath);
    if (typeof foundConfig === 'function') {
      config = Object.assign({}, foundConfig());
    } else {
      config = Object.assign({}, foundConfig);
    }
    return config;
  })
  .coerce('babel', utils.coerceBabel)
  .coerce('transform', (opt) => {
    const userTransformExclude = (userOptions
          && userOptions.transform
          && userOptions.transform.exclude)
        || [];
    const userTransformInclude = (userOptions
          && userOptions.transform
          && userOptions.transform.include)
        || [];
    const include = [...new Set([...opt.include, ...userTransformInclude])];
    const exclude = [
      ...new Set([
        ...opt.defaultExclude,
        ...opt.exclude,
        ...userTransformExclude,
      ]),
    ];
    opt.testExclude = testExclude({ include, exclude });
    opt.typescript.compilerOptions = Object.assign(
      { compilerOptions: {} },
      importCwd.silent(path.resolve(opt.typescript.config)),
    ).compilerOptions;
    return opt;
  })
  .coerce('chrome', (opt) => {
    if (opt.devtools) {
      opt.chromeFlags = ['--auto-open-devtools-for-tabs'];
      opt.launch = true;
    }
    return opt;
  }).argv;

module.exports = function transform(userOptions, skipParse = false) {
  let argv;
  if (!skipParse) {
    argv = getYargsOptions(userOptions);
    const nyc = new NYC(argv.nyc);
    argv.shouldInstrument = f => nyc.exclude.shouldInstrument(f);
    argv.shouldTransform = f => argv.transform.testExclude.shouldInstrument(f);
  } else {
    argv = userOptions;
  }

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
