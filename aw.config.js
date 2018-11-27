const cmd = process.argv.slice(2).shift();

module.exports = {
  coverage: true,
  url: 'http://localhost:9676/examples/index.html',
  mocks: [
    ['**/cdp/src/browser-shim.js', '{}'],
    ['**/*.{scss,less,css,html}'],
    ['./foobar-virtual.html', '"<div>hello world</div>"'],
    ['mocked-special', './examples/react/test/button-mock.js'],
  ],
  nyc: {
    exclude: [
      '**/*.html',
      '**/*.spec.*',
      '**/cli/src/index.js',
      '**/transform/src/index.js',
      '**/browser-shim.js',
      '**/commands/aw',
      '**/examples/main.js',
    ],
  },
  mocha: {
    reporter: 'spec',
  },
  'transform.typescript.babelOptions': {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions', 'safari >= 7'],
            node: 'current',
          },
          modules: cmd !== 'chrome' ? 'commonjs' : false,
        },
      ],
    ],
  },
  'filter.node.packages': [
    '!@after-work.js/example-*(protractor|puppeteer)',
    '!@after-work.js/example-chrome-*',
  ],
  'filter.node.files': [
    '!**/examples/chrome-*/**',
    '!**/examples/protractor/**',
    '!**/examples/puppeteer/**',
  ],
  'filter.chrome.packages': ['@after-work.js/example-chrome-*'],
  'filter.chrome.files': ['**/examples/chrome-*/**'],
  'filter.puppeteer.packages': ['@after-work.js/example-puppeteer'],
  'filter.puppeteer.files': ['**/examples/puppeteer/**'],
  'filter.protractor.files': ['**/examples/protractor/**'],
  artifactsPath: 'examples/protractor/test/__artifacts__', // rename to protractorArtifactsPath
};
