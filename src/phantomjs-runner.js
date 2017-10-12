import webpage from 'webpage'; //eslint-disable-line
import util from 'util';
import system from 'system';  //eslint-disable-line

const page = webpage.create();
const { args } = system;
const url = args[args.indexOf('--pageUrl') + 1];
// const singleRun = args[args.indexOf('--single-run') + 1] === 'true';

page.open(url, (status) => {
  if (status === 'fail') {
    console.log(`The url '${url}' could not be opened.\nphantomjs will shut down!`); // eslint-disable-line no-console
    phantom.exit(1); // eslint-disable-line no-undef
  }

  page.onCallback = (data) => {
    let msg = util.format(...data.args);
    msg = msg.replace('\u2713', 'v');
    msg = msg.replace(/[\w-]+\.spec\.js/, '\u001b[0m\u001b[31m$&\u001b[90m');
    console.log(msg); // eslint-disable-line no-console
  };
});
