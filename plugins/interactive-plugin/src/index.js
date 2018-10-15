const inquirer = require('inquirer');
const checkboxPlus = require('inquirer-checkbox-plus-prompt');
const fuzzy = require('fuzzy');
const utils = require('@after-work.js/utils');

const {
  packages,
  packagesMap,
  workspaces,
  lernaPackages,
  DEFAULT_TEST_GLOB_PATTERN,
  DEFAULT_SRC_GLOB_PATTERN,
} = utils;

let test = [];
let src = [];

const promptModule = inquirer.createPromptModule({ output: process.stderr });
promptModule.registerPrompt('checkbox-plus', checkboxPlus);

let currentPrompt;
const prompt = (questions) => {
  if (currentPrompt) {
    currentPrompt.ui.close();
  }
  currentPrompt = promptModule(questions);
  return currentPrompt;
};

const searchPackages = (input, inputPackages) => {
  input = input || '';
  return new Promise((resolve) => {
    setTimeout(() => {
      const fuzzyResult = fuzzy.filter(input, inputPackages);
      const val = fuzzyResult.map(el => el.original);
      resolve(val);
    });
  });
};

const searchTestFiles = (input, inputTestFiles) => {
  input = input || '';
  return new Promise((resolve) => {
    setTimeout(() => {
      const fuzzyResult = fuzzy.filter(input, inputTestFiles);
      const val = fuzzyResult.map(el => el.original);
      resolve(val);
    });
  });
};

const promptMainMenu = async (runner) => {
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

const promptPackages = async (message, inputPackages) => {
  const { pkgs } = await prompt([
    {
      type: 'checkbox-plus',
      name: 'pkgs',
      message,
      source: (_, input) => searchPackages(input, inputPackages),
      pageSize: 4,
      highlight: true,
      searchable: true,
    },
  ]);
  return pkgs;
};

const promptTestFiles = async (inputTestFiles) => {
  const { testFiles } = await prompt([
    {
      type: 'checkbox-plus',
      name: 'testFiles',
      message: 'Which test files?',
      source: (_, input) => searchTestFiles(input, inputTestFiles),
      pageSize: 4,
      highlight: true,
      searchable: true,
    },
  ]);
  return testFiles;
};

const onInteractive = (runner) => {
  const filter = runner.getFilter();

  (async () => {
    const interactive = await promptMainMenu(runner);
    if (interactive === 'quit') {
      runner.exit(0);
      process.exit();
    }
    if (interactive === 'all') {
      runner.run();
      return;
    }

    if (interactive === 'workspaces' || interactive === 'scopes') {
      const message = interactive === 'workspaces' ? 'Which workspaces?' : 'Which scopes';
      const inputPackages = (runner.argv.scope.length ? runner.argv.scope : packages);
      const filteredPackages = utils.filter(filter.packages, inputPackages);
      const pkgs = await promptPackages(message, filteredPackages);
      if (!Array.isArray(pkgs)) {
        onInteractive(runner, filter);
        return;
      }
      test = [];
      src = [];
      pkgs.forEach((name) => {
        const p = packagesMap.get(name);
        test = [...test, ...runner.findFiles(`${p}/${DEFAULT_TEST_GLOB_PATTERN}`)];
        src = [...src, ...runner.findFiles(`${p}/${DEFAULT_SRC_GLOB_PATTERN}`)];
      });
      if (Array.isArray(test) && test.length) {
        runner.setupAndRunTests(test, src);
      } else {
        onInteractive(runner, filter);
      }
      return;
    }

    if (interactive === 'filter') {
      const filteredTestFiles = utils.filter(filter.files, runner.testFiles);
      test = await promptTestFiles(filteredTestFiles);
      src = [];
      if (Array.isArray(test) && test.length) {
        runner.setupAndRunTests(test, []);
      } else {
        onInteractive(runner, filter);
      }
      return;
    }

    if (interactive === 'snapshots') {
      runner.argv.updateSnapshot = true;
      runner.snapshotStates.clear();
      runner.setupAndRunTests(test, src);
      runner.once('watchEnd', () => {
        runner.argv.updateSnapshot = false;
      });
    }
  })();
};

module.exports = function interactivePlugin(runner) {
  runner.on('watchEnd', () => onInteractive(runner));
  runner.on('interactive', () => onInteractive(runner));
};
