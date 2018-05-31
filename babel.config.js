module.exports = (api) => {
  api.cache(true);
  const cmd = process.argv.slice(2).shift();
  switch (cmd) {
    case 'chrome':
      return {
        sourceMaps: true,
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['last 2 versions', 'safari >= 7'],
            },
            modules: 'amd',
          }],
        ],
      };
    default:
      return {
        // presets: [
        //   ['@babel/preset-env', { node: 'current' }],
        // ],
        plugins: [
          // '@babel/plugin-transform-react-jsx',
          [
            'istanbul',
            {
              exclude: [
                '**/test/**',
              ],
            },
          ],
        ],
      };
  }
}

