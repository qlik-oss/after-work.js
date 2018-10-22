const utils = require('@after-work.js/utils');
const prompt = require('./prompt');
const promptMenu = require('./prompt-menu');

const {
  packages,
  packagesMap,
  workspaces,
  lernaPackages,
  DEFAULT_TEST_GLOB_PATTERN,
  DEFAULT_SRC_GLOB_PATTERN,
  DEFAULT_SRC_EXCLUDE_PATTERN,
  createDebug,
} = utils;

const debug = createDebug('interactive');
let test = [];
let src = [];

const onInteractive = (runner) => {
  const filter = runner.getFilter();

  (async () => {
    const interactive = await promptMenu({
      prompt,
      runner,
      workspaces,
      lernaPackages,
    });
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
      const inputPackages = runner.argv.scope.length
        ? runner.argv.scope
        : packages;
      const filteredPackages = utils.filter(filter.packages, inputPackages);
      const promptPackages = require('./prompt-packages');
      const searchPackages = require('./search-packages');
      const pkgs = await promptPackages({
        prompt,
        searchPackages,
        message,
        filteredPackages,
      });
      if (!Array.isArray(pkgs)) {
        onInteractive(runner, filter);
        return;
      }
      test = [];
      src = [];
      pkgs.forEach((name) => {
        const p = packagesMap.get(name);
        test = [
          ...test,
          ...runner.findFiles([
            `${p}/${DEFAULT_TEST_GLOB_PATTERN}`,
            '!**/node_modules/**',
            '!./node_modules/**',
          ]),
        ];
        src = [
          ...src,
          ...runner.findFiles([
            `${p}/${DEFAULT_SRC_GLOB_PATTERN}`,
            '!**/node_modules/**',
            '!./node_modules/**',
            ...DEFAULT_SRC_EXCLUDE_PATTERN.reduce(
              (acc, curr) => [...acc, `!**/${curr}/**`, `!./${curr}/**`],
              [],
            ),
          ]),
        ];
      });
      debug('packages', test, src);
      if (Array.isArray(test) && test.length) {
        runner.setupAndRunTests(test, src);
      } else {
        onInteractive(runner, filter);
      }
      return;
    }

    if (interactive === 'filter') {
      const filteredTestFiles = utils.filter(filter.files, runner.testFiles);
      const promptTestFiles = require('./prompt-test-files');
      const searchTestFiles = require('./search-test-files');
      test = await promptTestFiles({
        prompt,
        searchTestFiles,
        filteredTestFiles,
      });
      if (Array.isArray(test) && test.length) {
        const srcFiles = runner.getSrcFilesFromTestFiles(test);
        runner.setupAndRunTests(test, srcFiles);
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
