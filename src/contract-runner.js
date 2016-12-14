let childProcess = require( "child_process" );
let contracter = require( "./contract" );

export default {
	run: function( program ) {
		let child = childProcess.fork( program.bin, [], {
			stdio: "inherit"
		} );

    child.on( "exit", ( code ) => {
			process.exit( code );
		} );

		child.on( "message", function( data ) {
			/*eslint no-process-exit:0*/
			if ( data.status === "running" ) {
					contracter.start( program.dir ).then( code => {
					process.exit( code );
				} ).catch( () => {
					process.exit( -1 );
				} );
			}
		} );
	}
};
