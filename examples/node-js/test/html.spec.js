import virtual from './foobar-virtual.html'; // eslint-disable-line
import template from './foobar.html';

describe('html', () => {
  it('should import virtual template', () => {
    expect(virtual).toMatchSnapshot();
  });

  it('should import template', () => {
    expect(template).toMatchSnapshot();
  });
});
