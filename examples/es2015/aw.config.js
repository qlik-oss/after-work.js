module.exports = {
  url: 'http://localhost:9676/examples/es2015/index.html',
  glob: ['examples/es2015/*.spec.js'],
  watchGlob: ['examples/es2015/*.js'],
  'instrument.exclude': [
    '**/*main.js',
  ],
};
