
/* eslint no-process-exit:0, no-cond-assign: 0 */
import path from 'path';
import child_process from 'child_process'; // eslint-disable-line camelcase

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
  * Add default mocha specific arguments
  * @param  {string} command The command that will be spawned
  * @param  {Object} info    The parsing info Object
  */
  addDefaultMochaArgs(command, info) {
    const { cwd } = this.getEnvConfig();
    // Add default `mocha` arguments
    if (info.addMochaArgs) {
      if (command.indexOf('istanbul') !== -1 && !info.hasArgumentsSeparator) {
        info.commandArgs.push('--');
      }

      if (info.commandArgs.indexOf('--require') === -1) {
        info.commandArgs.push('--require', path.relative(cwd, path.resolve(__dirname, './config/global.js')));
      }

      if (info.commandArgs.indexOf('--opts') === -1) {
        info.commandArgs.push('--opts', path.relative(cwd, path.resolve(__dirname, './config/mocha.opts')));
      }

      if (info.commandArgs.indexOf('--compilers') === -1) {
        info.commandArgs.push('--compilers', 'js:babel-core/register');
      }
    }
  },

  /**
  * Parse the `process.argv` arguments
  * @param  {Array} args The arguments without `node` and `file` arguments
  * @return {Object} The parsed info object
  */
  parseArgs(args) {
    const { cwd, resolve } = this.getEnvConfig();
    let addMochaArgs = false;
    let hasArgumentsSeparator = false;
    const resolveStr = 'resolve=';

    const commandArgs = args.map((arg) => {
      if (typeof arg === 'string' && arg.indexOf(resolveStr) === 0) {
        arg = arg.slice(resolveStr.length);
        arg = path.relative(cwd, resolve(arg));
      }
      if (typeof arg === 'string' && arg.indexOf('mocha') !== -1) {
        addMochaArgs = true;
      }
      if (arg === '--') {
        hasArgumentsSeparator = true;
      }
      return arg;
    });

    return {
      commandArgs,
      addMochaArgs,
      hasArgumentsSeparator,
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
    console.log('The following command will be spawn: ', command, info.commandArgs.join(' ')); // eslint-disable-line no-console
    this.spawn(command, info.commandArgs);
  },
};

export { runner }; // eslint-disable-line import/prefer-default-export
