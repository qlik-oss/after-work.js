const createServer = require('../server');

const server = {
  command: ['serve [argv]'],
  desc: 'Serve files',
  builder(yargs) {
    return yargs
      .options({
        port: {
          description: 'Listen on this port',
          default: 9000,
          type: 'number',
        },
        root: {
          description: 'Serve root(s)',
          default: ['./'],
          type: 'array',
        },
        rewrite: {
          description: 'Rewrite url(s)',
          default: {},
          type: 'object',
        },
      });
  },
  handler(argv) {
    createServer(argv);
  },
};

module.exports = server;
