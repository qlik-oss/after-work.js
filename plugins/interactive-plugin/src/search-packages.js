const fuzzy = require('fuzzy');

const searchPackages = (input, inputPackages) => {
  input = input || '';
  return new Promise(resolve => {
    setTimeout(() => {
      const fuzzyResult = fuzzy.filter(input, inputPackages);
      const val = fuzzyResult.map(el => el.original);
      resolve(val);
    });
  });
};

module.exports = searchPackages;
