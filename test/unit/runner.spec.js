import { runner } from '../../src/runner';

describe('Runner', () => {
  let sandbox;

  describe('getEnvConfig', () => {
    let cwd;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(process, 'env').get(() => 'env');

      cwd = sandbox.stub(process, 'cwd');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call `process.argv.slice`', () => {
      const argv = sandbox.stub(process.argv, 'slice');
      const { args } = runner.getEnvConfig(); // eslint-disable-line no-unused-vars
      expect(argv).to.have.been.calledWithExactly(2);
    });

    it('should get environment', () => {
      expect(runner.getEnvConfig().env).to.equal('env');
    });

    it('should get current working directory', () => {
      cwd.returns('foo');
      expect(runner.getEnvConfig().cwd).to.equal('foo');
    });

    it('should get resolve', () => {
      expect(runner.getEnvConfig().resolve).to.be.a('function');
    });
  });
});
