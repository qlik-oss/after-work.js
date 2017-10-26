/* eslint-disable  */
const webpage = require('webpage');
const util = require('util');
const system = require('system');

const page = webpage.create();
const url = system.args[system.args.indexOf('--pageUrl') + 1];

page.open(url, function () {
  page.onCallback = function (data) {
    var msg = util.format.apply(null, data.args);
    msg = msg.replace('\u2713', 'v');
    msg = msg.replace(/[\w-]+\.spec\.js/, '\u001b[0m\u001b[31m$&\u001b[90m');
    console.log(msg);
  };
});
