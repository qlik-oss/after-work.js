/*eslint no-undef: 0 no-console: 0*/
mocha.delay( true ); //Adds a global `run` function
//mocha.bail( true );
mocha.fullTrace( true );
mocha.timeout( 0 );
//Handle `phantomjs`
if ( typeof callPhantom === "function" ) {
	Mocha.reporters.Base.useColors = true;
	Mocha.process.stdout.write = function() {};
	console.log = function() {
		callPhantom( { args: [].slice.call( arguments ) } );
	};
	mocha.reporter( "spec" );
}

mocha.ui( "bdd" );

let runner = mocha.run();
runner.on( "end", function() {
	if ( typeof callPhantom === "function" ) {
		callPhantom( { exit: true, failures: runner.failures } );
	}
} );

if ( typeof callPhantom === "function" ) {
	onerror = function() {
		let args = [].slice.call( arguments );
		console.error.apply( console, args );
		callPhantom( { exit: true, failures: runner.failures } );
	};
}
