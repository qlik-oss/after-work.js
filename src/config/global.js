import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";

global.sinon = sinon;
global.chai = chai;
global.expect = chai.expect;

chai.use( sinonChai );
chai.use( chaiAsPromised );
