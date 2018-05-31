/* eslint func-names: 0, no-underscore-dangle: 0, no-console: 0, no-undef: 0, prefer-rest-params: 0, one-var: 0, no-plusplus: 0, max-len: 0, prefer-const: 0, no-param-reassign: 0 */
(function (win) {
  function shimMocha(m) {
    const origRun = m.run.bind(m);

    m.run = () => {
      win.awMediator.emit('started', m.suite.suites.length);
      m.runner = origRun(() => {
        setTimeout(() => win.awMediator.emit('ended', m.runner.stats), 0);
      });
      return m.runner;
    };
  }
  Object.defineProperty(win, 'mocha', {
    get() {
      return undefined;
    },
    set(m) {
      shimMocha(m);
      delete win.mocha;
      win.mocha = m;
      m.setup(mochaOptions);
    },
    configurable: true,
  });

  Object.defineProperty(win, 'Mocha', {
    get() {
      return undefined;
    },
    set(m) {
      delete win.Mocha;
      win.Mocha = m;

      m.process.nextTick = cb => cb();
      m.process.stdout._write = (chunks, encoding, cb) => {
        const output = chunks.toString ? chunks.toString() : chunks;
        console.info(output);
        m.process.nextTick(cb);
      };

      win.awMediator.emit('width');
    },
    configurable: true,
  });

  // Mocha needs the formating feature of console.log so copy node's format function and
  // monkey-patch it into place. This code is copied from node's, links copyright applies.
  // https://github.com/joyent/node/blob/master/lib/util.js
  if (!console.format) {
    const origError = console.error;
    const origLog = console.log;

    console.format = function (f) {
      if (typeof f !== 'string') {
        return Array.prototype.map.call(arguments, (arg) => {
          try {
            return JSON.stringify(arg);
          } catch (_) {
            return '[Circular]';
          }
        }).join(' ');
      }
      let i = 1,
        args = arguments,
        len = args.length,
        str = String(f).replace(/%[sdj%]/g, (x) => {
          if (x === '%%') return '%';
          if (i >= len) return x;
          switch (x) {
            case '%s': return String(args[i++]);
            case '%d': return Number(args[i++]);
            case '%j':
              try {
                return JSON.stringify(args[i++]);
              } catch (_) {
                return '[Circular]';
              }
            default:
              return x;
          }
        }),
        x;
      for (x = args[i]; i < len; x = args[++i]) {
        if (x === null || typeof x !== 'object') {
          str += ` ${x}`;
        } else {
          str += ` ${JSON.stringify(x)}`;
        }
      }
      return str;
    };

    console.error = function () {
      origError.call(console, console.format(...arguments));
    };

    console.log = function () {
      origLog.call(console, console.format(...arguments));
    };
  }
}(window));
