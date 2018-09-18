const cmd = process.argv.slice(2).shift();

let url = null;
if (cmd === 'chrome') {
  url = 'http://localhost:9676/examples/index.html';
}

module.exports = {
  url,
  mocks: [
    ['**/cdp/src/browser-shim.js', '{}'],
    ['**/*.{scss,less,css,html}'],
    ['./foobar-virtual.html', '"<div>hello world</div>"'],
    ['mocked-special', './examples/react/test/button-mock.js'],
  ],
  nyc: {
    exclude: ['**/cli/src/index.js', '**/transform/src/index.js', '**/browser-shim.js', '**/commands/aw'],
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
  'filter.node.packages': [
    name => !name.includes('example-chrome'),
    name => !name.includes('example-protractor'),
    name => !name.includes('example-puppeteer'),
  ],
  'filter.node.files': [
    file => !file.includes('examples/chrome'),
    file => !file.includes('examples/protractor'),
    file => !file.includes('examples/puppeteer'),
  ],
  'filter.chrome.packages': [
    name => name.includes('example-chrome'),
  ],
  'filter.chrome.files': [
    file => file.includes('examples/chrome'),
  ],
  'filter.puppeteer.packages': [
    name => name.includes('example-puppeteer'),
  ],
  'filter.puppeteer.files': [
    file => file.includes('examples/puppeteer'),
  ],
};
