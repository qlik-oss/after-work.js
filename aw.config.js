/* eslint import/no-extraneous-dependencies: 0, prefer-destructuring: 0, no-param-reassign: 0 */

const yargs = require('yargs');
const path = require('path');
const globby = require('globby');
const { packages } = require('./lerna.json');

const setup = path.resolve(__dirname, 'aw.setup.js');
const cmd = process.argv.slice(2).shift();

const argv = yargs
  .options({
    scope: {
      description: 'Scope to package',
      type: 'string',
      default: '*',
      alias: 's',
    },
  })
  .coerce('scope', (scope) => {
    const scopes = new Map();
    const chromeExamplePackages = [];
    const nodePackages = [];
    globby.sync(packages.map(p => `${p}/package.json`)).forEach((p) => {
      const name = require(`./${p}`).name; //eslint-disable-line
      const pkgPath = path.dirname(p);
      scopes.set(name, pkgPath);
      if (name.startsWith('@after-work.js/example-chrome')) {
        chromeExamplePackages.push(pkgPath);
      } else {
        nodePackages.push(pkgPath);
      }
    });
    const s = scopes.get(scope);

    if (s) {
      return s;
    }
    if (cmd === 'chrome') {
      return `*(${chromeExamplePackages.join('|')})`;
    }
    return `*(${nodePackages.join('|')})`;
  })
  .argv;

let url = null;
if (cmd === 'chrome') {
  url = 'http://localhost:9676/examples/index.html';
}
const test = `${argv.scope}/test/**/*.spec.{js,ts}`;
const src = `${argv.scope}/src/**/*.{js,ts}`;

module.exports = {
  url,
  glob: [test],
  src: [src],
  watchGlob: [src, test],
  require: [setup], // move all requies to nyc in node runner
  nyc: {
    include: [src],
    exclude: ['**/cli/src/index.js', '**/browser-shim.js'],
    babel: false, // handle this separately
    sourceMap: false,
    instrumenter: './lib/instrumenters/noop',
  },
  mocha: {
    reporter: 'spec',
  },
  'transform.typescript.babelOptions': {
    presets: [
      ['@babel/preset-env', {
        targets: {
          browsers: ['last 2 versions', 'safari >= 7'],
        },
        modules: false,
      }],
    ],
  },
};
