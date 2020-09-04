const cmd = process.argv.slice(2).shift();

module.exports = {
  coverage: true,
  url: "http://localhost:9677/examples/index.html",
  mocks: [
    ["**/*.{scss,less,css,html}"],
    ["./foobar-virtual.html", '"<div>hello world</div>"'],
    [
      "mocked-special",
      "./examples/react/test/internal-aw-tests/button-mock.js",
    ],
  ],
  nyc: {
    exclude: [
      "**/*.html",
      "**/*.spec.*",
      "**/cli/src/index.js",
      "**/transform/src/index.js",
      "**/browser-shim.js",
      "**/commands/aw",
      "**/examples/main.js",
      "**/examples/react/src/full-match.js",
    ],
  },
  mocha: {
    reporter: "spec",
  },
  // Protractor mochaOpts
  mochaOpts: {
    reporterOptions: {
      name: "@after-work.js",
      version: "next",
    },
  },
  "transform.typescript.babelOptions": {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: ["last 2 versions", "safari >= 7"],
            node: "current",
          },
          modules: cmd !== "chrome" ? "commonjs" : false,
        },
      ],
    ],
  },
  "filter.node.packages": [
    "!@after-work.js/example-*(protractor|puppeteer|webpack-dev-server)",
    "!@after-work.js/example-chrome-*",
  ],
  "filter.node.files": [
    "!**/commands/protractor/src/config.js",
    "!**/examples/chrome-*/**",
    "!**/examples/protractor/**",
    "!**/examples/puppeteer/**",
    "!**/examples/webpack-dev-server/**",
  ],
  "filter.chrome.packages": ["@after-work.js/example-chrome-*"],
  "filter.chrome.files": [
    "**/examples/chrome-*/**",
    "!**/examples/chrome-esm/**",
  ],
  "filter.puppeteer.packages": ["@after-work.js/example-puppeteer"],
  "filter.puppeteer.files": ["**/examples/puppeteer/**"],
  "filter.protractor.files": ["**/examples/protractor/**"],
  artifactsPath: "test/__artifacts__",
  http: {
    port: 9677,
  },
  specs: ["./examples/protractor/test/hello.spec.js"],
  transform: {
    exclude: ["**/chrome-esm/**"],
  },
};
