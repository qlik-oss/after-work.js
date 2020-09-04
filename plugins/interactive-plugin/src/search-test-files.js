const fuzzy = require("fuzzy");

const searchTestFiles = (input, inputTestFiles) => {
  input = input || "";
  return new Promise((resolve) => {
    setTimeout(() => {
      const fuzzyResult = fuzzy.filter(input, inputTestFiles);
      const val = fuzzyResult.map((el) => el.original);
      resolve(val);
    });
  });
};

module.exports = searchTestFiles;
