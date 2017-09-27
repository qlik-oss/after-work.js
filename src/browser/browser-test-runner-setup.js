/* eslint no-undef: 0 no-console: 0, func-names: 0, prefer-rest-params: 0 */
mocha.delay(true); // Adds a global `run` function
// mocha.bail( true );
mocha.fullTrace(true);
mocha.timeout(0);
mocha.ui('bdd');
Mocha.reporters.Base.useColors = true; // To be able to get colors on the server
Mocha.process.stdout.write = () => { }; // Remove `stdout`

// Handle `phantomjs`
if (typeof callPhantom === 'function') {
  Mocha.reporters.Base.useColors = true;
  Mocha.process.stdout.write = function () { };
  console.log = function () {
    callPhantom({ args: [].slice.call(arguments) });
  };
  mocha.reporter('min');
}

var runner = mocha.run(); //eslint-disable-line
//  Hook up the `spec` reporter for server
new Mocha.reporters.Spec(runner); //eslint-disable-line

runner.on('end', () => {
  if (typeof callPhantom === 'function') {
    callPhantom({ exit: true, failures: runner.failures });
  }
});

if (typeof callPhantom === 'function') {
  onerror = function () { // eslint-disable-line no-restricted-globals
    const args = [].slice.call(arguments);
    console.error(...args);
    callPhantom({ exit: true, failures: runner.failures });
  };
}

// var browserLog = console.log.bind(console); //eslint-disable-line
// console.log = function () {
//   var msg = [].slice.call(arguments); //eslint-disable-line
//   window.___browserSync___.socket.emit('runner-log', msg); //eslint-disable-line
//   browserLog.apply(console, msg);
// };

// eslint-disable-next-line
runner.on('start', function() {
  window.___browserSync___.socket.emit('runner-start'); // eslint-disable-line
});

runner.on('end', function () {
  var coverage = window.__coverage__; //eslint-disable-line
  if (coverage) {
    window.___browserSync___.socket.emit('runner-end', { stats: this.stats, coverageObj: coverage }); //eslint-disable-line
  }
});

window.onerror = function () {
  console.log([].slice.call(arguments));
  window.___browserSync___.socket.emit('window-error'); //eslint-disable-line
};
