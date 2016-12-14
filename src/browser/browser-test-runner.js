/*eslint camelcase:0, no-process-exit: 0, no-console: 0*/
import path from "path";
import globby from "globby";
import Promise from "bluebird";
import { create } from "browser-sync";
import child_process from "child_process";
import program from "commander";

function srcFiles( files ) {
	return files.map( ( f ) => {
		return `<script src="${f}"></script>`;
	} ).join( "\n" );
}

export function relativeFromDirToCwd( p ) {
	return path.relative( process.cwd(), path.resolve( __dirname, p ) );
}

export function relativeToCwd( p ) {
	return path.relative( process.cwd(), path.resolve( p ) );
}

export function getFolder( f ) {
	return f.split( "\\" ).pop().split( "/" ).slice( 0, -1 ).join( "/" );
}

export function getBrowserSyncConfig( paths, files, options ) {
	const { dirs, phantomjs, startPath, requirejs, requirejsMain, requirejsStartPath, systemjs, systemjsStartPath } = options;
	const url = requirejs ? requirejsStartPath : systemjs ? systemjsStartPath : startPath;
	const rjs = [];
	if ( requirejs ) {
		rjs.push( relativeToCwd( getFolder( requirejs ) ) );
	}
	if ( requirejsMain ) {
		rjs.push( relativeToCwd( getFolder( requirejsMain ) ) );
	}
	return {
		open: !phantomjs,
		notify: false,
		port: 9676,
		ui: false,
		server: {
			baseDir: ["./"].concat( paths ).concat( rjs ).concat( dirs ),
			directory: true,
			middleware: ( req, res, next ) => {
				res.setHeader( "Cache-Control", "no-cache, no-store, must-revalidate" );
				res.setHeader( "Pragma", "no-cache" );
				res.setHeader( "Expires", "0" );
				next();
			}
		},
		startPath: url,
		rewriteRules: [{
			match: /%insert-files%/g,
			fn: () => {
				return srcFiles( files );
			}
		}, {
			match: /%insert-requirejs%/g,
			fn: () => {
				let insert = "";
				insert += "<script>var files = [" + files.map( f => "'" + f + "'" ).join( "," ) + "];</script>";
				insert += "<script data-main='" + requirejsMain.split( "\\" ).pop().split( "/" ).pop() + "' src='/" + requirejs.split( "\\" ).pop().split( "/" ).pop() + "'></script>\n";
				return insert;
			}
		}]
	};
}


export function runPhantom( url, singleRun ) {
	const phantomFile = relativeFromDirToCwd( "../phantomjs-runner.js" );
	const phantomBin = require.resolve( "phantomjs-prebuilt/bin/phantomjs" );
	const proc = child_process.fork( phantomBin, [phantomFile, "--pageUrl", url, "--single-run", singleRun], {
		env: process.env,
		cwd: process.cwd(),
		stdio: "inherit"
	} );

	proc.on( "exit", code => {
		process.exit( code );
	} );

	proc.on( "error", () => {
		process.exit( -1 );
	} );
}

export function runBrowserSync( files, options ) {
	const browserSync = create();
	const paths = [
		relativeFromDirToCwd( "./" ),
		path.dirname( require.resolve( "mocha" ) ),
		path.dirname( require.resolve( "chai" ) )
	];

	if ( options.systemjs ) {
		paths.push( path.join( path.dirname( require.resolve( "systemjs" ) ), "dist" ) );
		paths.push( path.dirname( require.resolve( "babel-core" ) ) );
	}

	return new Promise( function( resolve, reject ) {
		browserSync.pause();

		browserSync.watch( files ).on( "change", ( event, file ) => {
			browserSync.reload( file );
		} );

		browserSync.init( getBrowserSyncConfig( paths, files, options ), ( err, bs ) => {
			if ( err ) {
				reject( err );
				return;
			}
			const local = bs.options.get( "urls" ).get( "local" );
			resolve( local );
		} );
	} );
}

export function run( args, options ) {
	const files = globby.sync( args );
	if ( !files.length ) {
		console.log( "No files found for:", args );
		process.exit( 0 );
	}

	runBrowserSync( files, options ).then( url => {
		if ( options.phantomjs ) {
			runPhantom( url, options.phantomjsSingleRun );
		}
	} );
}

export function runProgram() {
	program
		.arguments( "<paths>", "Paths to spec files" )
		.option( "-s, --start-path [path]", "Path to start page", "browser-test-runner.html" )
		.option( "-p, --phantomjs [phantomjs]", "Run in phantomjs", false )
		.option( "--requirejs [path]", "Path to requirejs", "" )
		.option( "--requirejs-main [path]", "Path to requirejs main", "" )
		.option( "--requirejs-start-path [path]", "Path to requirejs start path", "browser-test-runner-requirejs.html" )
		.option( "--systemjs-start-path [path]", "Path to systemjs start path", "browser-test-runner-systemjs.html" )
		.option( "-d, --dirs [paths]", "Paths to directories to serve", arg => {
			return arg.split( "," ).map( p => {
				return path.relative( process.cwd(), path.resolve( p ) );
			} );
		}, [] )
		.option( "--phantomjs-single-run [single run]", "Run once", false )
		.option( "--systemjs", "Run test files in an `systemjs` with babel as transpiler environment", false )
		.parse( process.argv );

	if ( !program.args[0] ) {
		program.outputHelp();
		process.exit( 0 );
	}
	run( program.args, program );
}
