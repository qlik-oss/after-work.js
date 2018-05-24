/* eslint import/no-extraneous-dependencies: 0, prefer-destructuring: 0 */

const yargs = require('yargs');
const path = require('path');

const setup = path.resolve(__dirname, 'packages/cli/src/env.js');

const argv = yargs
  .options({
    'opt.basePath': {
      description: 'Base path',
      type: 'string',
      default: 'packages/*/',
    },
    'opt.package': {
      description: 'Package name',
      type: 'string',
      default: '*',
      alias: 'p',
    },
    'opt.src': {
      description: 'Source',
      type: 'array',
      default: ['src/**/*.js'],
      alias: 's',
    },
    require: {
      description: 'Require',
      type: 'array',
      default: [],
      alias: 'r',
    },
  })
  .coerce('opt', (opt) => {
    if (opt.package !== '*') {
      if (process.cwd() === __dirname) {
        opt.basePath = 'packages/';
        opt.package += '/';
      } else {
        opt.basePath = '';
        opt.package = '';
      }
      opt.src = [`${opt.basePath}${opt.package}${opt.src}`];
    } else {
      opt.src = [`${opt.basePath}cli/src/**/!(index|)*.js`, `${opt.basePath}${opt.package}src/**/!(browser-shim|)*.js`];
    }
    return opt;
  })
  .argv;

module.exports = {
  require: [setup],
  glob: [`${argv.opt.basePath}${argv.opt.package}test/**/*.spec.js`],
  src: argv.opt.src,
  watchGlob: [`${argv.opt.basePath}${argv.opt.package}src/**/*.js`, `${argv.opt.basePath}${argv.opt.package}test/**/*.spec.js`],
  nyc: {
    include: `${argv.opt.basePath}${argv.opt.package}src`,
  },
  coverage: true,
};
