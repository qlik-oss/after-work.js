const browser = {
  command: 'browser',
  desc: 'Run in browser',
  builder(yargs) {
    return yargs.commandDir('browser_cmds');
  },
};

module.exports = browser;
