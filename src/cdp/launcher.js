const chromeLauncher = require('chrome-launcher');

module.exports = async function launch(options) {
  return chromeLauncher.launch(options);
};
