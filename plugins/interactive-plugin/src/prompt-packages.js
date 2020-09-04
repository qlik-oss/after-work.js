const promptPackages = async ({
  prompt,
  searchPackages,
  message,
  filteredPackages,
}) => {
  const { pkgs } = await prompt([
    {
      type: "checkbox-plus",
      name: "pkgs",
      message,
      source: (_, input) => searchPackages(input, filteredPackages),
      pageSize: 4,
      highlight: true,
      searchable: true,
    },
  ]);
  return pkgs;
};

module.exports = promptPackages;
