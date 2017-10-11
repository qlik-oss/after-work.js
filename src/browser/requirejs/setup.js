/* eslint-disable */
mocha.delay(true); // Adds a global `run` function
// mocha.bail( true );
mocha.fullTrace(true);
mocha.timeout(0);
mocha.ui('bdd');

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

runner.on('end', function() {
  if (typeof callPhantom === 'function') {
    callPhantom({ exit: true, failures: runner.failures });
  }
});

// Hook up errors and send to server
if (typeof callPhantom === 'function') {
  onerror = function () { // eslint-disable-line no-restricted-globals
    var args = [].slice.call(arguments);
    console.error.apply(null, args);
    callPhantom({ exit: true, failures: runner.failures });
  };
}

// eslint-disable-next-line
runner.on('start', function() {
  window.___browserSync___.socket.emit('runner-start'); // eslint-disable-line
});

runner.on('end', function () {
  var coverage = window.__coverage__; //eslint-disable-line
    window.___browserSync___.socket.emit('runner-end', { stats: this.stats, coverageObj: coverage }); //eslint-disable-line
});

window.onerror = function () {
  console.log([].slice.call(arguments));
  window.___browserSync___.socket.emit('window-error'); //eslint-disable-line
};
