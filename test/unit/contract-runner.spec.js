import child_process from "child_process"; // eslint-disable-line camelcase
import contractRunner from "../../src/contract-runner";
import contracter from "../../src/contract";
import Promise from "bluebird";

describe( "Contract Runner", () => {

	let start;
	let sandbox;
	let fork;
	let on;
	let exit;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
		on = sandbox.stub();
		fork = sandbox.stub( child_process, "fork" ).returns( {
			on: on
		} );
		start = sandbox.stub( contracter, "start" ).returns( Promise.resolve( 0 ) );
		exit = sandbox.stub( process, "exit" );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( "run", () => {

		it( "should call fork", () => {
			contractRunner.run( { bin: "", dir: "" } );
			expect( fork.callCount ).to.be.equal( 1 );
		} );

		it( "should start the contracter and resolve with a successful statuscode", () => {
			contractRunner.run( { bin: "", dir: "" } );
			on.callArgWith( 1, { status: "running" } );
			expect( start() ).to.eventually.be.equal( 0 );
		} );

		it( "should exit on rejection", () => {
			const reject = Promise.reject( new Error( "Foo" ) );
			start.returns( reject );
			contractRunner.run( { bin: "", dir: "" } );
			on.callArgWith( 1, { status: "running" } );
			return reject.then().catch( () => {
				expect( exit ).to.have.been.calledWithExactly( -1 );
			} );
		} );

	} );
} );
