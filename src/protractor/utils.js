/* global browser */
const dns = require('dns');
const os = require('os');
const http = require('http');
const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const favicon = require('koa-favicon');

module.exports = {
  getFullQualifiedDNSName() {
    return new Promise((resolve, reject) => {
      dns.lookup(os.hostname(), (lookupErr, add) => {
        if (lookupErr) {
          reject(lookupErr);
          return;
        }
        dns.reverse(add, (reverseErr, fqdn) => {
          if (reverseErr) {
            reject(reverseErr);
            return;
          }
          resolve(fqdn[0]);
        });
      });
    });
  },
  getIPaddress() {
    return new Promise((resolve, reject) => {
      dns.lookup(os.hostname(), (lookupErr, add) => {
        if (lookupErr) {
          reject(lookupErr);
          return;
        }
        resolve(add);
      });
    });
  },
  httpServer(options = { root: ['test/fixtures'], port: 9000 }) {
    const app = new Koa();
    app.use(favicon(path.resolve(__dirname, '../../aw.png')));
    app.use(...options.root.map(root => serve(path.resolve(process.cwd(), root))));
    return app.listen(options.port);
  },
  logSeleniumNodeInfo(config) {
    browser.getSession().then((session) => {
      const sessionId = session.getId();
      console.log(`WebDriverSessionID: ${sessionId}`); // eslint-disable-line no-console

      if (!config.seleniumAddress || config.seleniumAddress.trim() === '') {
        return;
      }

      const url = config.seleniumAddress.replace('wd/hub', `grid/api/testsession?session=${sessionId}`);

      http.get(url, (res) => {
        let result = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          result += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 300) {
            result = result[0].errorText;
            if (result) {
              console.error(result); // eslint-disable-line no-console
            }
            return;
          }

          if (result.length > 0) {
            result = JSON.parse(result);
            const nodeUrl = result.proxyId.replace(/:\d+$/g, '');
            browser.params.grid = {};
            browser.params.grid.node = nodeUrl;
            browser.params.grid.extraUrl = `${nodeUrl}:3000`;
            browser.params.grid.extraVideo = `${nodeUrl}:3000/download_video/${sessionId}.mp4`;

            console.log(`Selenium Node Console: ${result.proxyId}/wd/hub/static/resource/hub.html`); // eslint-disable-line no-console
            console.log(`Grid Extra Node: ${browser.params.grid.extraUrl}`); // eslint-disable-line no-console
            console.log(`Grid Extra Video: ${browser.params.grid.extraVideo}`); // eslint-disable-line no-console
          }
        });
      }).on('error', (e) => {
        console.error(e); // eslint-disable-line no-console
      });
    });
  },
};

