import Promise from "bluebird";
import dns from "dns";
import os from "os";
import { create } from "browser-sync";

export const getFullQualifiedDNSName = function() {
	return new Promise( ( resolve, reject ) => {
		dns.lookup( os.hostname(), function( lookupErr, add ) {
			if ( lookupErr ) {
				reject( lookupErr );
				return;
			}
			dns.reverse( add, function( reverseErr, fqdn ) {
				if ( reverseErr ) {
					reject( reverseErr );
					return;
				}
				resolve( fqdn[0] );
			} );
		} );
	} );
};

export const getIPaddress = function() {
	return new Promise( ( resolve, reject ) => {
		dns.lookup( os.hostname(), function( lookupErr, add ) {
			if ( lookupErr ) {
				reject( lookupErr );
				return;
			}
				resolve( add );
		} );
	} );
};

export function httpServer( config = {} ) {
	const bs = create();
	const defaultConfig = {
		logLevel: "silent",
		notify: false,
		port: 9000,
		open: false,
		directory: true,
		ui: false,
		server: {
			baseDir: "./test/fixtures"
		},
		//Middleware to swallow error for missing favicon
		middleware: [ {
			route: "/favicon.ico",
			handle: function ( req, res, next ) {
				res.statusCode = 200;
				res.setHeader( "Content-Length", "0" );
				res.end();
				next();
			}
		} ]
	};

	config = Object.assign( defaultConfig, config );

	return new Promise( function( resolve, reject ) {
		bs.pause();

		bs.init( config, function( err ) {
			if ( err ) {
				reject( err );
				return;
			}
			resolve();
		} );
	} );
}
