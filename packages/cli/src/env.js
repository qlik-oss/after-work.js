/* eslint import/no-extraneous-dependencies: 0 */
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const sourceMapSupport = require('source-map-support');

global.sinon = sinon;
global.chai = chai;
global.expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiSubset);

sourceMapSupport.install();
