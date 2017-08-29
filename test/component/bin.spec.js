import path from 'path';
import child_process from 'child_process'; // eslint-disable-line camelcase
import { runner } from '../../src/runner';

describe('bin', () => {
  let sandbox;
  let getEnvConfig;
  const requireResolve = arg => arg;
  const defaultEnvConfig = {
    args: [],
    env: {},
    cwd: '',
    platform: '',
    resolve: requireResolve,
  };
  let spawn;
  let on;
  const spawnOptions = {
    cwd: '',
    env: {},
    stdio: 'inherit',
  };
  const defaultArgs = [
    '--require',
    './config/global.js',
    '--opts',
    './config/mocha.opts',
    '--compilers',
    'js:babel/register'];
  let processExit;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(path, 'resolve', (arg1, arg2) => arg2);
    sandbox.stub(path, 'relative', (arg1, arg2) => arg2);
    on = sandbox.stub();
    spawn = sandbox.stub(child_process, 'spawn').returns({
      on,
    });
    getEnvConfig = sandbox.stub(runner, 'getEnvConfig').returns(defaultEnvConfig);
    processExit = sandbox.stub(process, 'exit');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('`aw-test-runner`', () => {
    const spawnArgs = ['resolve=.bin/mocha'];
    const command = '.bin/mocha';
    const commandExt = '.cmd';

    describe('win32', () => {
      const envConfig = Object.create(defaultEnvConfig, {
        platform: { value: 'win32' },
      });

      beforeEach(() => {
        getEnvConfig.returns(envConfig);
      });

      it('should run mocha with default args', () => {
        envConfig.args = ['./bar'];
        runner.execute(spawnArgs);
        expect(spawn).to.have.been.calledWith(command + commandExt,
          envConfig.args.concat(defaultArgs), spawnOptions);
      });

      it('should run mocha with custom args', () => {
        envConfig.args = ['./foo', '--require', './foo', '--opts', './bar.opts', '--recursive', '-b', '--timeout', 3000, '--compilers', 'js:babel-core/register'];
        runner.execute(spawnArgs);
        expect(spawn).to.have.been.calledWith(command + commandExt, envConfig.args, spawnOptions);
      });
    });

    describe('non win32', () => {
      const envConfig = Object.create(defaultEnvConfig, {
        platform: { value: 'non win32' },
      });

      beforeEach(() => {
        getEnvConfig.returns(envConfig);
      });

      it('should run mocha', () => {
        envConfig.args = ['./bar'];
        runner.execute(spawnArgs);
        expect(spawn).to.have.been.calledWith(command);
      });
    });
  });

  describe('`aw-test-coverage`', () => {
    const spawnArgs = ['resolve=.bin/istanbul', 'cover', 'resolve=mocha/bin/_mocha'];
    const command = '.bin/istanbul';
    const commandExt = '.cmd';
    const defaultCommandArgs = ['cover', 'mocha/bin/_mocha'];


    describe('win32', () => {
      const envConfig = Object.create(defaultEnvConfig, {
        platform: { value: 'win32' },
      });

      beforeEach(() => {
        getEnvConfig.returns(envConfig);
      });

      it('should run istanbul cover with mocha default args', () => {
        envConfig.args = ['./bar'];
        const commandArgs = defaultCommandArgs.concat(envConfig.args, ['--'], defaultArgs);
        runner.execute(spawnArgs);
        expect(spawn).to.have.been.calledWith(command + commandExt, commandArgs, spawnOptions);
      });

      it('should run istanbul with mocha custom args', () => {
        envConfig.args = ['./foo', '--', '--recursive', '-b', '--timeout', 3000];
        const commandArgs = defaultCommandArgs.concat(envConfig.args, defaultArgs);
        runner.execute(spawnArgs);
        expect(spawn).to.have.been.calledWith(command + commandExt, commandArgs, spawnOptions);
      });
    });
  });

  describe('`aw-browser-test-runner`', () => {
    const spawnArgs = ['resolve=.bin/protractor'];
    const command = '.bin/protractor';
    const commandExt = '.cmd';

    describe('win32', () => {
      const envConfig = Object.create(defaultEnvConfig, {
        platform: { value: 'win32' },
      });

      beforeEach(() => {
        getEnvConfig.returns(envConfig);
      });

      it('should run protractor with default args', () => {
        envConfig.args = ['./node_modules/sensei-e2e/lib/browser/conf.js --specs ./test/e2e/*.spec.js --browser-sync=test/e2e/conf.browsersync'];
        runner.execute(spawnArgs);
        expect(spawn).to.have.been.calledWith(command + commandExt, envConfig.args, spawnOptions);
      });
    });
  });

  describe('process', () => {
    describe('on', () => {
      describe('exit', () => {
        it('should exit with code', () => {
          on.callsArgWith(1, 9).onFirstCall();
          runner.execute([]);
          expect(processExit).to.have.been.calledWithExactly(9);
          expect(on.callCount).to.equal(2);
        });
      });

      describe('error', () => {
        it('should exit with -1', () => {
          on.callsArg(1).onSecondCall();
          runner.execute([]);
          expect(processExit).to.have.been.calledWithExactly(-1);
          expect(on.callCount).to.equal(2);
        });
      });
    });
  });
});
