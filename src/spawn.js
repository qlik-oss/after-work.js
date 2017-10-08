const cp = require('child_process');

module.exports = function spawn(command, commandArgs) {
  const { env, platform } = process;
  const cwd = process.cwd();

  if (platform === 'win32') {
    command += '.cmd';
  }

  const proc = cp.spawn(command, commandArgs, { // eslint-disable-line camelcase
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

  return proc;
};
