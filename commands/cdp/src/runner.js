/* eslint no-console: 0, class-methods-use-this: 0, no-restricted-syntax: 0 */
const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const chromeLauncher = require("chrome-launcher");
const unmirror = require("chrome-unmirror");
const globby = require("globby");
const precinct = require("precinct");
const createServer = require("@after-work.js/server");
const NYC = require("nyc");
const utils = require("@after-work.js/utils");
const { deleteTransform } = require("@after-work.js/transform");
const Mediator = require("./mediator");
const connect = require("./connect");

class Runner extends EventEmitter {
  constructor(argv) {
    super();
    this.argv = argv;
    this.nyc = new NYC(argv.nyc);
    argv.shouldInstrument = (f) => this.nyc.exclude.shouldInstrument(f);
    argv.shouldTransform = (f) =>
      argv.transform.testExclude.shouldInstrument(f);
    this.mediator = new Mediator();
    this.chromeLauncher = chromeLauncher;
    this.ended = false;
    this.loadError = false;
    this.requests = new Map();
    this.started = false;
    this.isRunning = false;
    this.depMap = new Map();
    this.srcTestMap = new Map();
    this.testFiles = [];
    this.srcFiles = [];
    this.bind();
    this.debugging = false;
    this.server = { close: () => {} };
  }

  log(...args) {
    console.error(...args);
  }

  bind() {
    this.mediator.on("width", () => {
      if (!this.client) {
        return;
      }
      const columns =
        (parseInt(process.env.COLUMNS || process.stdout.columns) * 0.75) | 0;
      const expression = `Mocha.reporters.Base.window.width = ${columns};`;
      this.client.Runtime.evaluate({ expression });
    });
    this.mediator.on("started", (tests) => {
      this.started = true;
      if (this.argv.coverage) {
        this.nyc.reset();
      }
      utils.clearLine();
      this.log("Runner started\n");

      if (tests === 0) {
        this.log("mocha.run() was called with no tests");
      }
    });

    this.mediator.on("ended", (stats) => {
      this.log("Runner ended\n");
      this.started = false;
      this.ended = true;
      this.isRunning = false;
      this.exit(stats.tests ? stats.failures : 1);
    });
  }

  pipeOut(Runtime) {
    Runtime.exceptionThrown((exception) => {
      this.log("[chrome-exception]", exception);
      this.exit(1);
    });

    Runtime.consoleAPICalled(({ type, args }) => {
      if (type === "info") {
        process.stdout.write(args.shift().value);
        return;
      }
      if (type === "warning") {
        type = "warn";
      }
      if (!(type in console)) {
        type = "log";
      }
      const data = args.map((arg) =>
        arg.type === "string" ? arg.value : unmirror(arg)
      );
      console[type](...data);
    });
  }

  pipeNetwork(Network) {
    Network.requestWillBeSent((info) => {
      this.requests.set(info.requestId, info.request);
      if (!this.started && info.request.url.match(/^(file|http(s?)):\/\//)) {
        utils.writeLine("Loading", info.request.url);
      }
    });
    Network.loadingFailed((info) => {
      const { errorText } = info;
      const { url, method } = this.requests.get(info.requestId);
      const msg = JSON.stringify({ url, method, errorText });
      this.log("Resource Failed to Load:", msg);
      this.mediator.emit("resourceFailed", msg);
      this.loadError = true;
    });
  }

  launch(options) {
    return this.chromeLauncher.launch(options);
  }

  async setup(testFiles) {
    if (this.argv.chrome.launch) {
      this.chrome = await this.launch(this.argv.chrome);
      const { port } = this.chrome;
      this.argv.client.port = port;
    }
    const awFiles = this.relativeBaseUrlFiles(testFiles || this.testFiles);
    this.client = await connect(
      this.argv,
      awFiles,
      this.argv.presetEnv,
      this.debugging
    );
    if (!this.client) {
      this.log("CDP Client could not connect");
      return;
    }
    const { DOMStorage, Runtime, Network } = this.client;
    this.mediator.bind(DOMStorage);
    this.pipeOut(Runtime);
    this.pipeNetwork(Network);
    Network.clearBrowserCache();
  }

  async navigate() {
    if (!this.argv.url) {
      this.log("`options.url` must be specified to run tests");
      this.exit(1);
      return;
    }
    const url = this.getUrl(this.argv.url);
    if (this.loadError) {
      this.log(`Failed to load the url: ${url}`);
      return;
    }
    this.log(`Navigating to ${url}`);
    this.isRunning = true;
    await this.client.Page.navigate({ url: this.argv.url });
  }

  getDependencies(f) {
    const cached = this.depMap.get(f);
    if (cached) {
      return cached;
    }
    const rf = utils.ensureFilePath(f);
    const deps = precinct(fs.readFileSync(rf, "utf8"), {
      amd: { skipLazyLoaded: true },
    });
    this.depMap.set(f, deps);
    return deps;
  }

  matchDependencyName(srcName, deps) {
    for (const dep of deps) {
      const name = path.basename(dep);
      if (name === srcName) {
        return true;
      }
    }
    return false;
  }

  getMatchedTestDependency(file) {
    const cache = this.srcTestMap.get(file);
    if (cache) {
      return cache;
    }
    const srcName = path.basename(file).split(".").shift();
    for (const testFile of this.testFiles) {
      const deps = this.getDependencies(testFile);
      const found = this.matchDependencyName(srcName, deps);
      if (found) {
        this.srcTestMap.set(file, [testFile]);
        return [testFile];
      }
    }
    return this.testFiles;
  }

  setupAndRunTests(testFiles) {
    this.isRunning = true;
    (async () => {
      if (!this.client) {
        await this.run(testFiles);
        return;
      }
      const awFiles = this.relativeBaseUrlFiles(testFiles || this.testFiles);
      const injectAwFiles = `window.awFiles = ${JSON.stringify(awFiles)};`;
      await this.client.Page.reload({
        ignoreCache: true,
        scriptToEvaluateOnLoad: injectAwFiles,
      });
    })();
  }

  getTestFilesFromSrcFiles(srcFiles) {
    return srcFiles.reduce(
      (acc, curr) => [...acc, ...this.getMatchedTestDependency(curr)],
      []
    );
  }

  getSrcFilesFromTestFiles() {
    return [];
  }

  autoDetectDebug() {
    const exv = process.execArgv.join();
    const debug = exv.includes("inspect") || exv.includes("debug");
    if (debug || this.argv.chrome.devtools) {
      this.argv.mocha.timeout = 0;
      this.debugging = true;
    }
    return this;
  }

  relativeBaseUrlFile(file) {
    return path
      .relative(path.dirname(this.argv.url), path.resolve(file))
      .replace(/\\/g, "/")
      .replace(/.ts$/, ".js");
  }

  relativeBaseUrlFiles(files) {
    return files.map((file) => this.relativeBaseUrlFile(file));
  }

  findFiles(glob) {
    return utils.filter(
      this.getFilter().files,
      globby.sync(glob).map((f) => path.resolve(f))
    );
  }

  getFilter() {
    return this.argv.filter.chrome;
  }

  setTestFiles() {
    this.testFiles = this.findFiles(this.argv.glob).filter((f) =>
      utils.isTestFile(f, this.argv)
    );
    if (!this.testFiles.length) {
      this.log(
        `No files found for glob: ${this.argv.glob} with filter: ${
          this.getFilter().files
        }`
      );
      this.exit(1);
    }
    return this;
  }

  getUrl(url) {
    if (!/^(file|http(s?)):\/\//.test(url)) {
      if (!fs.existsSync(url)) {
        url = `file://${path.resolve(path.join(process.cwd(), url))}`;
      }
      if (fs.existsSync(url)) {
        url = `file://${fs.realpathSync(url)}`;
      }
    }
    return url;
  }

  maybeCreateServer() {
    if (/^(http(s?)):\/\//.test(this.argv.url)) {
      this.server = createServer(this.argv);
    }
    return this;
  }

  run(testFiles) {
    (async () => {
      await this.setup(testFiles);
      await this.navigate();
    })();
  }

  async extractCoverage() {
    const {
      result: { value },
    } = await this.client.Runtime.evaluate({
      expression: "window.__coverage__",
      returnByValue: true,
    });
    return value;
  }

  exit(code) {
    (async () => {
      if (code === 0 && this.argv.coverage) {
        const coverage = await this.extractCoverage();
        fs.writeFileSync(
          path.resolve(this.nyc.tempDirectory(), `${Date.now()}.json`),
          JSON.stringify(coverage, null, 2),
          "utf8"
        );
        this.nyc.report();
      }
      if (this.argv.watch) {
        this.emit("watchEnd");
        return;
      }
      if (this.client) {
        try {
          await this.client.close();
          if (this.argv.chrome.launch) {
            await this.chrome.kill();
          }
        } catch (err) {
          this.log(err);
        }
      }
      if (this.server) {
        this.server.close();
      }
      process.exitCode = code;
    })();
  }

  safeDeleteCache(f) {
    deleteTransform(f);
  }
}

module.exports = Runner;
