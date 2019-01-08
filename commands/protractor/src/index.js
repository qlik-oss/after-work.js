/* eslint global-require: 0, no-console: 0, import/no-unresolved: 0, import/no-extraneous-dependencies: 0, import/no-dynamic-require: 0, max-len: 0 */
const path = require('path');

const protractor = {
  command: ['protractor', 'ptor'],
  desc: 'Run protractor',
  handler() {
    let launcher;
    try {
      launcher = require('protractor/built/launcher');
    } catch (_) {
      console.error('Could not load protractor/built/launcher');
      const p = `${path.resolve(
        process.cwd(),
      )}/node_modules/protractor/built/launcher`;
      console.error(`Trying: ${p}`);
      try {
        launcher = require(p);
      } catch (__) {
        console.error(
          'Protractor could not be found by after-work.js! Please verify that it has been added as a devDependencies in your package.json',
        );
        process.exit(1);
      }
    }
    launcher.init(path.resolve(__dirname, './config.js'));
  },
};

module.exports = protractor;
