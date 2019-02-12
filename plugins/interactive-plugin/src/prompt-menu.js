const prompMenu = async ({
  prompt, runner, workspaces, lernaPackages,
}) => {
  const all = !!runner.testFiles.length;
  const allChoice = all
    ? [{ key: 'a', name: 'All (initial glob)', value: 'all' }]
    : [];
  const snapshotsNeedUpdate = runner.argv.updateSnapshot === false
    && [
      ...((runner.snapshotContexts && runner.snapshotContexts.values()) || []),
    ].filter(
      ({ snapshotState }) => snapshotState.unmatched > 0 || snapshotState.getUncheckedCount() > 0,
    ).length;
  const snapshotChoice = snapshotsNeedUpdate
    ? [{ key: 'u', name: 'Update snapshots', value: 'snapshots' }]
    : [];
  const workspacesChoice = workspaces.length
    ? [{ key: 'w', name: 'Workspaces', value: 'workspaces' }]
    : [];
  const lernaPkgsChoice = lernaPackages.length
    ? [{ key: 's', name: 'Scopes', value: 'scopes' }]
    : [];
  const { interactive } = await prompt([
    {
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
    },
  ]);
  return interactive;
};

module.exports = prompMenu;
