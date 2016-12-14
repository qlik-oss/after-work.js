import plugin from "../../../../src/plugins/screenshoter/index";

describe( "Screenshoter Index", () => {
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
		let browser = {
			element: sandbox.stub()
		};

		let protractor = {
			By: sandbox.stub()
		};
		global.browser = browser;
		global.protractor = protractor;
	} );

	afterEach( () => {
		global.browser = undefined;
		global.protractor = undefined;
		sandbox.restore();
	} );

	it( "should setup the screenshoter plugin", () => {
		expect( plugin.setup ).not.to.throw();
	} );

} );
