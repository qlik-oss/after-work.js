/* global browser*/
import Promise from 'bluebird';
import dns from 'dns';
import os from 'os';
import { create } from 'browser-sync';
import http from 'http';

export const getFullQualifiedDNSName = function getFullQualifiedDNSName() {
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
};

export const getIPaddress = function getIPaddress() {
  return new Promise((resolve, reject) => {
    dns.lookup(os.hostname(), (lookupErr, add) => {
      if (lookupErr) {
        reject(lookupErr);
        return;
      }
      resolve(add);
    });
  });
};

export function httpServer(config = {}) {
  const bs = create();
  const defaultConfig = {
    logLevel: 'silent',
    notify: false,
    port: 9000,
    open: false,
    directory: true,
    ui: false,
    server: {
      baseDir: './test/fixtures',
    },
    // Middleware to swallow error for missing favicon
    middleware: [{
      route: '/favicon.ico',
      handle(req, res, next) {
        res.statusCode = 200;   // eslint-disable-line no-param-reassign
        res.setHeader('Content-Length', '0');
        res.end();
        next();
      },
    }],
  };

  config = Object.assign(defaultConfig, config);    // eslint-disable-line no-param-reassign

  return new Promise((resolve, reject) => {
    bs.pause();

    bs.init(config, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function logSeleniumNodeInfo(config) {
  browser.getSession().then((session) => {
    const sessionId = session.getId();
    console.log(`WebDriverSessionID: ${sessionId}`); // eslint-disable-line no-console

    if (!config.seleniumAddress || config.seleniumAddress.trim() === '') {
      return;
    }

    console.log(`SeleniumAddress: ${config.seleniumAddress}`); // eslint-disable-line no-console

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
        } else {
          if (result.length > 0) {
            result = JSON.parse(result);
          }
          console.log(`Selenium Node (Proxy): ${result.proxyId}`); // eslint-disable-line no-console
          console.log(`Selenium Node Console: ${result.proxyId}/wd/hub/static/resource/hub.html`); // eslint-disable-line no-console
        }
      });
    }).on('error', (e) => {
      console.error(e); // eslint-disable-line no-console
    });
  });
}
