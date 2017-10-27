(function run() {
  requirejs.config({
    paths: {
      chai: 'https://cdnjs.cloudflare.com/ajax/libs/chai/4.1.2/chai.min',
    },
  });
  requirejs(['./test.spec.js'], () => {
    mocha.run();
  });
}());
