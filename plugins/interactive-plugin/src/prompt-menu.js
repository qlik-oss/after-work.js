const prompMenu = async ({
  prompt,
  runner,
  workspaces,
  lernaPackages,
}) => {
  const all = !!runner.testFiles.length;
  const allChoice = all ? [{ key: 'a', name: 'All (initial glob)', value: 'all' }] : [];
  const unmatchedSnapshots = runner.argv.updateSnapshot === false && [...runner.snapshotStates.values()].filter(v => v.unmatched > 0).length;
  const snapshotChoice = unmatchedSnapshots ? [{ key: 'u', name: 'Update failing snapshots', value: 'snapshots' }] : [];
  const workspacesChoice = workspaces.length ? [{ key: 'w', name: 'Workspaces', value: 'workspaces' }] : [];
  const lernaPkgsChoice = lernaPackages.length ? [{ key: 's', name: 'Scopes', value: 'scopes' }] : [];
  const { interactive } = await prompt([{
    type: 'expand',
    name: 'interactive',
    message: 'Interactive usage',
    choices: [
      ...allChoice,
      ...workspacesChoice,
      ...lernaPkgsChoice,
      { key: 'f', name: 'Filter', value: 'filter' },
      ...snapshotChoice,
      { key: 'q', name: 'Quit', value: 'quit' },
    ],
  }]);
  return interactive;
};

module.exports = prompMenu;
