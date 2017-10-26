/* eslint no-console:0 */
const CDP = require('chrome-remote-interface');
const util = require('util');
const chromeLauncher = require('chrome-launcher');

module.exports = function runChromeHeadless(url) {
  chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu'],
  }).then((chrome) => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
    CDP({ port: chrome.port }, (client) => {
      const { Runtime, Page } = client;
      Promise.all([Runtime.enable(), Page.enable()])
        .then(() => {
          Runtime.consoleAPICalled((msg) => {
            if (msg.type === 'log') {
              const args = msg.args.map(e => e.value);
              let log = util.format.apply(null, args);
              log = log.replace('\u2713', 'v');
              log = log.replace(/[\w-]+\.spec\.js/, '\u001b[0m\u001b[31m$&\u001b[90m');
              console.log(log);
            }
          });
          return Page.navigate({ url })
            .then(() => Page.loadEventFired());
        }).catch(console.error);
    }).on('error', (err) => {
      console.error(err);
    });
    process.on('exit', () => {
      chrome.kill();
    });
  });
};
