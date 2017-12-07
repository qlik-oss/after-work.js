'use strict';

module.exports = {
  url: 'http://localhost:9676/examples/requirejs/index.html',
  glob: ['examples/requirejs/*.spec.js'],
  watchGlob: ['examples/requirejs/*.js'],
  'instrument.exclude': [
    '**/*main.js',
  ],
};
