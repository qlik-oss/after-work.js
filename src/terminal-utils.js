const readline = require('readline');

const utils = {
  clearLine() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
  },
  writeLine(msg) {
    this.clearLine();
    process.stdout.write(`${msg}`);
  },
};

module.exports = utils;
