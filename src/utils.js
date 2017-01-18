/*global browser*/
import Promise from "bluebird";
import dns from "dns";
import os from "os";
import { create } from "browser-sync";
import http from "http";

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

export function logSeleniumNodeInfo( config ) {
	browser.getSession().then( function ( session ) {
		let sessionId = session.getId();
		console.log( "WebDriverSessionID: " + sessionId ); //eslint-disable-line no-console

		if ( !config.seleniumAddress || config.seleniumAddress.trim() === "" ) {
			return;
		}

		console.log( "SeleniumAddress: " + config.seleniumAddress ); //eslint-disable-line no-console

		let url = config.seleniumAddress.replace( "wd/hub", "grid/api/testsession?session=" + sessionId );

		http.get( url, function ( res ) {
			let result = "";
			res.setEncoding( "utf8" );
			res.on( "data", function ( chunk ) {
				result += chunk;
			} );
			res.on( "end", function () {
				if ( res.statusCode >= 300 ) {
					result = result[0].errorText;
					if ( result ) {
						console.error( result ); //eslint-disable-line no-console
					}
				} else {
					if ( result.length > 0 ) {
						result = JSON.parse( result );
					}
					console.log( "Selenium Node (Proxy): " + result.proxyId ); //eslint-disable-line no-console
					console.log( "Selenium Node Console: " + result.proxyId + "/wd/hub/static/resource/hub.html" ); //eslint-disable-line no-console
				}
			} );
		} ).on( "error", function ( e ) {
			console.error( e ); //eslint-disable-line no-console
		} );
	} );
}
