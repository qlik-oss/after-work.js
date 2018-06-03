require('./packages/cli/src/env');

const path = require('path');

const configFile = path.resolve(__dirname, 'babel.config.js');

require('@babel/register')({
  // cache: true,
  ignore: [],
  configFile,
});
