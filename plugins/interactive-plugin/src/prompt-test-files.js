const promptTestFiles = async ({
  prompt,
  searchTestFiles,
  filteredTestFiles,
}) => {
  const { testFiles } = await prompt([
    {
      type: "checkbox-plus",
      name: "testFiles",
      message: "Which test files?",
      source: (_, input) => searchTestFiles(input, filteredTestFiles),
      pageSize: 4,
      highlight: true,
      searchable: true,
    },
  ]);
  return testFiles;
};

module.exports = promptTestFiles;
