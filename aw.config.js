const yargs = require('yargs');
const path = require('path');
const globby = require('globby');
const { packages } = require('./lerna.json');

const cmd = process.argv.slice(2).shift();

let glob = [];
let src = [];

yargs
  .options({
    scope: {
      description: 'Scope to package',
      type: 'string',
      default: '',
      alias: 's',
    },
  })
  .coerce('scope', (scope) => {
    const scopes = new Map();
    globby.sync(packages.map(p => `${p}/package.json`)).forEach((p) => {
      const { name } = require(`./${p}`);
      const pkgPath = path.dirname(p);
      scopes.set(name, pkgPath);
    });
    const s = scopes.get(scope);
    if (scope && !s) {
      throw new Error(`Scope ${scope} not found`);
    }
    if (scope) {
      glob = [`${s}/test/**/*.spec.{js,ts}`];
      src = [`${s}/src/**/*.{js,ts}`];
      return scope;
    }
    if (cmd === 'chrome') {
      [...scopes.keys()]
        .filter(k => k.includes('example-chrome'))
        .map(k => scopes.get(k))
        .forEach((p) => {
          glob = [...glob, `${p}/test/**/*.spec.{js,ts}`];
          src = [...src, `${p}/src/**/*.{js,ts}`];
        });
    } else {
      [...scopes.keys()]
        .filter(k => (!k.includes('example-chrome') && !k.includes('example-protractor') && !k.includes('example-puppeteer')))
        .map(k => scopes.get(k))
        .forEach((p) => {
          glob = [...glob, `${p}/test/**/*.spec.{js,ts}`];
          src = [...src, `${p}/src/**/*.{js,ts}`];
        });
    }
    return '';
  })
  .argv;

let url = null;
if (cmd === 'chrome') {
  url = 'http://localhost:9676/examples/index.html';
}

module.exports = {
  url,
  glob,
  src,
  watchGlob: [...src, ...glob],
  mocks: [
    ['**/cdp/src/browser-shim.js', '{}'],
    ['**/*.{scss,less,css,html}'],
    ['./foobar-virtual.html', '"<div>hello world</div>"'],
  ],
  nyc: {
    include: src,
    exclude: ['**/cli/src/index.js', '**/transform/src/index.js', '**/browser-shim.js', '**/commands/aw'],
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
          node: 'current',
        },
        modules: cmd !== 'chrome' ? 'commonjs' : false,
      }],
    ],
  },
  'instrument.exclude': [
    '**/main.js',
  ],
  coverage: true,
};
