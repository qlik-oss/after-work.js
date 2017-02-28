import webpage from 'webpage'; //eslint-disable-line
import util from 'util';
import system from 'system';  //eslint-disable-line

const page = webpage.create();
const args = system.args;
const url = args[args.indexOf('--pageUrl') + 1];
const singleRun = args[args.indexOf('--single-run') + 1] === 'true';

page.open(url, () => {
  page.onCallback = (data) => {
    if (data.exit && singleRun) {
      const exitCode = data.failures > 0 ? 1 : 0;
      phantom.exit(exitCode); // eslint-disable-line no-undef
    }
    let msg = util.format(...data.args);
    msg = msg.replace('\u2713', 'v');
    msg = msg.replace(/[\w-]+\.spec\.js/, '\u001b[0m\u001b[31m$&\u001b[90m');
    console.log(msg); // eslint-disable-line no-console
  };
});
