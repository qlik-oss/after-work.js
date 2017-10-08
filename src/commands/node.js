const node = {
  command: 'node',
  desc: 'Run in node',
  builder(yargs) {
    return yargs.commandDir('node_cmds');
  },
};

module.exports = node;
