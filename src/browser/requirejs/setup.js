/* eslint-disable */
mocha.delay(true); // Adds a global `run` function
// mocha.bail( true );
mocha.fullTrace(true);
mocha.timeout(0);
mocha.ui('bdd');
Mocha.reporters.Base.useColors = true;
mocha.reporter('min');
Mocha.process.stdout.write = function () { };

if (typeof callPhantom === 'function') {
  Mocha.reporters.Base.useColors = true;
  Mocha.process.stdout.write = function () { };
  console.log = function () {
    callPhantom({ args: [].slice.call(arguments) });
  };
  mocha.reporter('min');
}

var runner = mocha.run();

runner.on('start', function () {
  window.___browserSync___.socket.emit('runner-start');
});

runner.on('end', function () {
  var coverage = window.__coverage__;
  window.___browserSync___.socket.emit('runner-end', { stats: this.stats, coverageObj: coverage }); //eslint-disable-line
});

window.onerror = function () {
  console.log([].slice.call(arguments));
  window.___browserSync___.socket.emit('window-error');
};
