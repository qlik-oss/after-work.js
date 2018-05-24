const readline = require('readline');

const isCI = !!process.env.CI;

const utils = {
  clearLine() {
    if (isCI) {
      return;
    }
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
  },
  writeLine(msg) {
    if (isCI) {
      return;
    }
    this.clearLine();
    process.stdout.write(`${msg}`);
  },
};

module.exports = utils;
