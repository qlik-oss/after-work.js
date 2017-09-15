
/* eslint no-process-exit:0, no-cond-assign: 0 */
import path from 'path';
import child_process from 'child_process'; // eslint-disable-line camelcase
import fs from 'fs';

const runner = {

  /**
  * Gets the current environment configuration.
  * @return {Object}
  */
  getEnvConfig() {
    return {
      get args() {
        return process.argv.slice(2);
      },
      get env() {
        return process.env;
      },
      get cwd() {
        return process.cwd();
      },
      get platform() {
        return process.platform;
      },
      get resolve() {
        return require.resolve;
      },
    };
  },

  /**
  * Add default nyc specific arguments
  * @param  {string} command The command that will be spawned
  * @param  {Object} info    The parsing info Object
  */
  addDefaultNycArgs(command, info) {
    const { cwd, resolve } = this.getEnvConfig();

    // Check for nyc options in repo
    let nycSettingsProvided = false;
    const packageJSON = JSON.parse(fs.readFileSync(path.resolve(cwd, 'package.json'), { encoding: 'utf8' }));

    if (fs.existsSync(path.resolve(cwd, '.nycrc'))) { nycSettingsProvided = true; }
    if (packageJSON.nyc) { nycSettingsProvided = true; }

    if (!info.addMochaArgs) {
      info.commandArgs.unshift('mocha');
      // info.commandArgs.unshift('../after-work.js/node_modules/.bin/mocha');
      // info.commandArgs.push(path.relative(__dirname, resolve('mocha')));
      // info.commandArgs.push(path.relative(cwd, resolve('/.bin/mocha')));
    }

    if (info.addNycArgs) {
      // Remove cover argument
      info.commandArgs.splice(info.commandArgs.indexOf('cover'), 1);
      if (nycSettingsProvided) {
        console.log('Found nyc options for the repository, no defaults will be used'); // eslint-disable-line no-console
      } else {
        console.log('Adding default nyc options'); // eslint-disable-line no-console
        info.commandArgs.unshift(
          '--reporter=text',
          '--reporter=lcov',
          '--all',
          '--include', 'src',
          '--require', 'babel-register',
        );
      }
    }
  },

  /**
  * Add default mocha specific arguments
  * @param  {string} command The command that will be spawned
  * @param  {Object} info    The parsing info Object
  */
  addDefaultMochaArgs(command, info) {
    const { cwd } = this.getEnvConfig();
    // Check for mocha options in repo
    const mochaOpts = process.argv.indexOf('--opts') !== -1;
    const mochaOptsFile = fs.existsSync(path.resolve(cwd, 'test/mocha.opts'));

    // Add default `mocha` arguments
    if ((info.addMochaArgs || info.addNycArgs) && !mochaOpts && !mochaOptsFile) {
      console.log('Adding default mocha options'); // eslint-disable-line no-console
      info.commandArgs.unshift('--require', path.relative(cwd, path.resolve(__dirname, './config/global.js')));
      info.commandArgs.unshift('--opts', path.relative(cwd, path.resolve(__dirname, './config/mocha.opts')));

      if (!info.addNycArgs) {
        info.commandArgs.unshift('--compilers', 'js:babel-core/register');
      }
    } else {
      console.log('Found mocha options for the repository, no defaults will be used'); // eslint-disable-line no-console
    }
  },

  /**
  * Add debug specific arguments
  * @param  {string} command The command that will be spawned
  * @param  {Object} info    The parsing info Object
  */
  addDebugArgs(command, info) {
    // Add default `debug` arguments
    if (info.addDebugArgs) {
      info.commandArgs.push(
        '--debug-brk',
        '--inspect',
        '--no-timeouts',
      );
    }
  },

  /**
  * Parse the `process.argv` arguments
  * @param  {Array} args The arguments without `node` and `file` arguments
  * @return {Object} The parsed info object
  */
  parseArgs(args) {
    const { cwd, resolve } = this.getEnvConfig();
    let addNycArgs = false;
    let addMochaArgs = false;
    let addDebugArgs = false;
    // let hasArgumentsSeparator = false;
    const resolveStr = 'resolve=';

    const commandArgs = args.map((arg) => {
      if (typeof arg === 'string' && arg.indexOf(resolveStr) === 0) {
        arg = arg.slice(resolveStr.length);
        arg = path.relative(cwd, resolve(arg));
      }
      if (typeof arg === 'string' && arg.indexOf('nyc') !== -1) {
        addNycArgs = true;
      }
      if (typeof arg === 'string' && arg.indexOf('mocha') !== -1) {
        addMochaArgs = true;
      }
      if (typeof arg === 'string' && arg.indexOf('--debug') !== -1) {
        addDebugArgs = true;
      }
      // if (arg === '--') {
      //   hasArgumentsSeparator = true;
      // }
      return arg;
    });

    return {
      commandArgs,
      addNycArgs,
      addMochaArgs,
      addDebugArgs,
      // hasArgumentsSeparator,
    };
  },

  /**
  * Spawns a child
  * @param  {string} command     The commandExt
  * @param  {Array} commandArgs The command arguments
  */
  spawn(command, commandArgs) {
    const { env, cwd, platform } = this.getEnvConfig();

    if (platform === 'win32') {
      command += '.cmd';
    }

    const proc = child_process.spawn(command, commandArgs, { // eslint-disable-line camelcase
      env,
      cwd,
      stdio: 'inherit',
    });

    proc.on('exit', (code) => {
      process.exit(code);
    });

    proc.on('error', () => {
      process.exit(-1);
    });
  },

  /**
  * Execute `after-work` specific `spawnArgs`
  * @param  {Array} spawnArgs The arguments to be parsed and later spawned
  */
  execute(spawnArgs) {
    const { args } = this.getEnvConfig();

    spawnArgs = spawnArgs.concat(args);
    const info = this.parseArgs(spawnArgs);
    const command = info.commandArgs.shift();

    this.addDefaultMochaArgs(command, info);
    this.addDefaultNycArgs(command, info);
    this.addDebugArgs(command, info);

    if (info.addDebugArgs) { console.log('The following command will be spawn: ', command, info.commandArgs.join(' ')); } // eslint-disable-line no-console
    this.spawn(command, info.commandArgs);
  },
};

export { runner }; // eslint-disable-line import/prefer-default-export
