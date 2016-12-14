#! /usr/bin/env node

var program = require( "commander" );
var path = require( "path" );
var contractRunner = require( "../dist/contract-runner" );

program.version( "0.1.0" )
	.option( "-d, --dir [dir]", "The folder path containing all contracts" )
	.option( "-b, --bin [bin]", "The filepath responsible for starting your service" )
	.parse( process.argv );

program.dir = path.resolve( program.dir );
program.bin = path.resolve( program.bin );

contractRunner.run( program );
