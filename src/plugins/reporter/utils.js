import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";
import util from "util";
import Highlight from "highlight.js";

Highlight.configure( {
  tabReplace: "    ",
  useBR: true,
  languages: ["javascript"]
} );

export let utils = {
	getRepoInfo() {
		let packageJSON = JSON.parse( fs.readFileSync( path.resolve( process.cwd(), "package.json" ), { encoding: "utf8" } ) );
		let repoInfo = {};

		repoInfo.name = packageJSON.name || "No repository name found (please add to package.json)";
		repoInfo.description = packageJSON.description || "No repository description found (please add to package.json)";
		repoInfo.version = packageJSON.version || "No repository version found (please add to package.json)";

		return repoInfo;
	},
	cleanCode( str ) {
		str = str
		.replace( /\r\n?|[\n\u2028\u2029]/g, "\n" )
		.replace( /^\uFEFF/, "" )
		.replace( /^function *\(.*\) *{|\(.*\) *=> *{?/, "" )
		.replace( /\s+\}$/, "" );

		let spaces = str.match( /^\n?( *)/ )[1].length,
		tabs = str.match( /^\n?(\t*)/ )[1].length,
		re = new RegExp( "^\n?" + ( tabs ? "\t" : " " ) + "{" + ( tabs ? tabs : spaces ) + "}", "gm" );

		str = str.replace( re, "" );
		str = str.replace( /^\s+|\s+$/g, "" );
		return str;
	},
	errorJSON( err ) {
		let res = {};
		Object.getOwnPropertyNames( err ).forEach( key => {
			res[key] = err[key];
		}, err );

		if ( res && res.stack ){
			res.stack = Highlight.fixMarkup( Highlight.highlightAuto( res.stack ).value );
		}

		return res;
	},
	cleanTest( test ) {
		let code, body;

		if ( test.fn ){
			code = utils.cleanCode( test.fn.toString() );
			code = Highlight.fixMarkup( Highlight.highlightAuto( code ).value );
		}

		if ( test.body ){
			body = utils.cleanCode( test.body );
			body = Highlight.fixMarkup( Highlight.highlightAuto( body ).value );
		}

		return {
			title: test.title,
			fullTitle: test.fullTitle(),
			state: test.state || "skipped",
			passed: test.state === "passed",
			failed: test.state === "failed",
			pending: test.pending,
			code: code || body,
			timedOut: test.timedOut,
			duration: test.duration,
			file: test.file,
			screenshot: test.screenshot || "",
			err: utils.errorJSON( test.err || {} ),
			consoleEntries: test.consoleEntries || []
		};
	},
	createArtifactsFolder( browser ) {
		mkdirp.sync( path.resolve( browser.artifactsPath ) );
	},
	safeFileName( title ) {
		return title.replace( /[^a-z0-9().]/gi, "_" ).toLowerCase();
	},
	screenshotName( title, browserName, startTime ) {
		let safeFileName = utils.safeFileName( title );
		return util.format( "%s-%s-%s.png", safeFileName, browserName, startTime );
	},
	saveScreenshot( browser, title ) {
		let screenshot = path.resolve( browser.artifactsPath, "screenshots", utils.screenshotName( title, browser.reporterInfo.browserName, browser.reporterInfo.startTime ) );

		mkdirp.sync( path.resolve( browser.artifactsPath, "screenshots" ) );

		return browser.takeScreenshot().then( png => {
			fs.writeFileSync( screenshot, png, { encoding: "base64" } );
		} );

	}
};

export default utils;
