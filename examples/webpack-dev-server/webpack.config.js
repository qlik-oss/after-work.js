const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const transform = require('@after-work.js/transform-middleware');

const host = '0.0.0.0';
const port = process.env.PORT || 8080;

const config = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.js'),
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  devServer: {
    host,
    port,
    publicPath: `http://${host}:${port}/examples/webpack-dev-server/`,
    stats: 'minimal',
    before(app) {
      app.use(
        transform({
          transform: {
            exclude: ['**/examples/webpack-dev-server**'],
          },
        }),
      );
    },
  },
};

module.exports = config;
