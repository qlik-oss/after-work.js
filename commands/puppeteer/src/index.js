/* eslint global-require: 0, import/no-dynamic-require: 0, object-curly-newline: 0, class-methods-use-this: 0, max-len: 0 */
const path = require("path");
const util = require("util");
const mkdirp = require("mkdirp");
const importCwd = require("import-cwd");
const chromeFinder = require("chrome-launcher/dist/chrome-finder");
const { getPlatform } = require("chrome-launcher/dist/utils");
const terminalImage = require("terminal-image");
const createServer = require("@after-work.js/server");
const { Runner, configure } = require("@after-work.js/node/src/");
const nodeOptions = require("@after-work.js/node/src/options");
const utils = require("@after-work.js/utils");
const puppetOptions = require("./options");

const options = Object.assign({}, nodeOptions, puppetOptions);

const getSafeFileName = (title) => {
  const fileName = title.replace(/[^a-z0-9().]/gi, "_").toLowerCase();
  return util.format("%s-%s-%s.png", fileName, "chrome", +new Date());
};

class PuppetRunner extends Runner {
  constructor(puppeteer, argv, libs) {
    super(argv, libs);
    this.puppeteer = puppeteer;
    this.screenshots = [];
  }

  static async getChromeExecutablePath(stable) {
    if (!stable) {
      const launcher = importCwd.silent("puppeteer");
      if (!launcher) {
        throw new Error(
          "Cannot find Chromium. Make sure you have puppeteer installed"
        );
      }
      const exePath = launcher.executablePath();
      return exePath;
    }
    const installations = await chromeFinder[getPlatform()]();
    if (installations.length === 0) {
      throw new Error("Chrome not installed");
    }
    return installations.pop(); // If you have multiple installed chromes return regular chrome
  }

  async launch() {
    if (this.argv.httpServer) {
      this.server = createServer(this.argv);
    }
    if (this.argv.chrome.slowMo && this.argv.chrome.slowMo > 0) {
      this.argv.mocha.timeout = false;
    }

    if (this.argv.launch) {
      this.browser = await this.puppeteer.launch(this.argv.chrome);
    } else {
      this.browser = await this.puppeteer.connect(this.argv.chrome);
    }

    global.browser = this.browser;
    const pages = await this.browser.pages();
    if (pages.length) {
      global.page = pages.shift();
    } else {
      global.page = await this.browser.newPage();
    }
  }

  runTests() {
    super.runTests();
    this.mochaRunner.on("fail", (test, err) => {
      const screenshotsPath = `${this.argv.artifactsPath}/screenshots`;
      mkdirp.sync(screenshotsPath);
      const filePath = path.resolve(
        screenshotsPath,
        getSafeFileName(test.fullTitle())
      );
      const screenshot = {
        title: test.fullTitle(),
        buffer: page.screenshot({
          path: filePath,
          fullPage: true,
          err,
        }),
        filePath,
      };
      this.screenshots.push(screenshot);
    });
  }

  async handleScreenshots() {
    if (this.screenshots.length) {
      console.error("\u001b[31mscreenshots:\u001b[0m");
      console.error("");
    }
    await Promise.all(
      this.screenshots.map(async (screenshot) => {
        const buffer = await screenshot.buffer;
        console.error(`  ${screenshot.title}`);
        console.error(
          `  \u001b[90m${path.relative(
            process.cwd(),
            screenshot.filePath
          )}\u001b[0m`
        );
        console.error("");
        if (this.argv.screenshotsStderr) {
          console.error(await terminalImage.buffer(buffer));
          console.error("");
        }
      })
    );
    this.screenshots.length = 0;
  }

  closeBrowser() {
    (async () => {
      await this.handleScreenshots();
      await this.browser.close();
    })();
  }

  exit(code) {
    if (this.server) {
      this.server.close();
    }
    this.closeBrowser();
    super.exit(code);
  }

  getFilter() {
    return this.argv.filter.puppeteer;
  }

  // Override register and skip warnings
  register() {
    if (this.argv.hookRequire) {
      require("@after-work.js/register")(
        this.argv,
        this.srcFiles,
        this.testFiles
      );
    }
  }
}

const puppet = {
  Runner: PuppetRunner,
  command: ["puppeteer", "puppet"],
  desc: "Run tests with puppeteer",
  builder(yargs) {
    return yargs
      .middleware(utils.addDefaults)
      .options(options)
      .config("config", configure)
      .coerce("babel", utils.coerceBabel)
      .coerce("artifactsPath", (p) => path.resolve(process.cwd(), p));
  },
  handler(argv) {
    (async function launchAndRun() {
      const puppeteer = require("puppeteer-core");
      if (argv.launch && !argv.chrome.executablePath) {
        try {
          argv.chrome.executablePath = await PuppetRunner.getChromeExecutablePath(
            argv.chrome.stable
          );
        } catch (err) {
          console.error(err);
          process.exitCode = 1;
          return null;
        }
      }
      const runner = new PuppetRunner(puppeteer, argv);

      if (argv.presetEnv) {
        require("@after-work.js/preset-plugin")(runner);
      }
      let skipInitialInteractive = false;
      if (argv.watch && !argv.interactive) {
        skipInitialInteractive = true;
        argv.interactive = true;
      }
      if (argv.interactive) {
        const onWatchEnd = async () => {
          await runner.handleScreenshots();
        };
        require("@after-work.js/interactive-plugin")(runner, onWatchEnd);
      }
      if (argv.watch) {
        require("@after-work.js/watch-plugin")(runner);
      }
      await runner.launch();
      runner.autoDetectDebug().setTestFiles().setSrcFiles().require();
      if (!skipInitialInteractive && argv.interactive) {
        runner.emit("interactive");
        return runner;
      }
      runner.run();
      return runner;
    })();
  },
};

module.exports = puppet;
