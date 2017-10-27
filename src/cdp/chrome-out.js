/* eslint no-console: 0 */
const unmirror = require('chrome-unmirror');

const unknownTypes = [
  'assert',
  'clear',
  'count',
  'dir',
  'dirxmnl',
  'endGroup',
  'profile',
  'profileEnd',
  'startGroup',
  'startGroupCollapsed',
  'table',
  'timeEnd',
  'trace',
];

module.exports = function chromeOut(Runtime) {
  Runtime.exceptionThrown((exception) => {
    console.error('[chrome-exception]', exception);
  });

  Runtime.consoleAPICalled(({ type, args }) => {
    if (type === 'warning') {
      type = 'warn';
    }

    const data = args.map(arg => (arg.type === 'string' ? arg.value : unmirror(arg)));

    if (unknownTypes.includes(type)) {
      type = 'log';
    }

    console[type].apply(this, data);
  });
};
