const childProcess = require('child_process');
const contracter = require('./contract');

export default {
  run(program) {
    const child = childProcess.fork(program.bin, [], {
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      process.exit(code);
    });

    child.on('message', (data) => {
            /* eslint no-process-exit:0*/
      if (data.status === 'running') {
        contracter.start(program.dir).then((code) => {
          process.exit(code);
        }).catch(() => {
          process.exit(-1);
        });
      }
    });
  },
};
