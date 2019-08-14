/* eslint global-require: 0, import/no-dynamic-require: 0 */
const fs = require('fs');

const server = {
  command: ['serve'],
  desc: 'Serve files',
  builder(yargs) {
    return yargs
      .options({
        config: {
          description: 'Path to config file',
          type: 'string',
          default: null,
          alias: 'c',
        },
        'http.port': {
          description: 'Listen on this port',
          default: 9000,
          type: 'number',
        },
      })
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
          config = { ...foundConfig() };
        } else {
          config = { ...foundConfig };
        }
        return config;
      });
  },
  handler(argv) {
    const createServer = require('@after-work.js/server');
    createServer(argv);
  },
};

module.exports = server;
