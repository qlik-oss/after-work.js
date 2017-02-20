/* Acknowledgements:
 This reporter is highly influenced by mochawesome (http://adamgruber.github.io/mochawesome) but
 with some modifications to suite our reporting format.

 For a more generic reporter checkout the work of Adam Gruber (https://github.com/adamgruber)
 */

import Promise from "bluebird";
import mocha from "mocha";
import fs from "fs";
import path from "path";
import utils from "./utils";
import report from "./create-static";

let Base = mocha.reporters.Base;

export default function uiReport( runner, options ) {
    let tests = [];
    let pending = 0;
    let failures = 0;
    let passes = 0;
    let browser = options.reporterPlugin.getBrowser();
    let artifactsPath = browser.artifactsPath;
    let info = browser.reporterInfo;
    let waitForPromises = [];

    let reportName = info.browserName + "-report-" + info.startTime + "_" + Math.floor( Math.random() * 10000000 );

    if ( options.reporterOptions ) {
        if ( options.reporterOptions.xunit ) {
            options.reporterOptions.output = path.resolve( artifactsPath, reportName + ".xml" );
            new mocha.reporters.XUnit( runner, options );	//eslint-disable-line no-new
        }
    }

    Base.call( this, runner );

    //Since we can't extract the information from
    //protractor we need to hook up own reporter and
    //therefor we must make sure we have finished
    //generating the report before the process is shutdown
    //This is handled by a inline dummy plugins
    //and hooking into the `teardown` function
    options.reporterPlugin.teardown = function () {
        return Promise.all( waitForPromises );
    };

    runner.on( "pass", test => {
        console.log( "\u001b[32m √ PASSED: %s ( %sms )\u001b[0m", test.fullTitle(), test.duration );	//eslint-disable-line no-console
        tests.push( test );
        passes++;
    } );

    runner.on( "pending", test => {
        tests.push( test );
        pending++;
    } );

    runner.on( "fail", ( test, err ) => {
        test.consoleEntries = [];
        waitForPromises.push( utils.saveScreenshot( browser, test.fullTitle() ) );

        console.log( "\u001b[31m X FAILED: %s ( %sms )\u001b[0m\n" + 	//eslint-disable-line no-console
            "\u001b[33m     %s\u001b[0m\n" +
            "\u001b[34m     %s\u001b[0m", test.fullTitle(), test.duration, err.message, test.file );

        if ( browser.reporterInfo.browserName === "chrome" ) {
            browser.manage().logs().get( "browser" ).then( function ( browserLog ) {
                if ( browserLog && browserLog.length ) {
                    console.log( "\u001b[91m     %s\u001b[0m", "Errors reported in the chrome console - see log for more information" ); //eslint-disable-line no-console
                    browserLog.forEach( function ( log ) {
                        if ( log.level.value_ >= 1000 ) { //eslint-disable-line no-underscore-dangle
                            test.consoleEntries.push( log.message );
                        }
                    } );
                }
            } );
        }

        test.screenshot = ( "screenshots/" + utils.screenshotName( test.fullTitle(), info.browserName, info.startTime ) );
        tests.push( test );
        failures++;
    } );

    runner.on( "end", function () {
        let repoInfo = utils.getRepoInfo();
        let cleanTests = tests.map( utils.cleanTest );

        let obj = {
            tests: cleanTests,
            stats: {
                suites: this.stats.suites,
                tests: cleanTests.length,
                passes: passes,
                pending: pending,
                failures: failures,
                start: this.stats.start,
                mainStart: info.mainStart,
                end: this.stats.end,
                duration: this.stats.duration,
                browserName: info.browserName,
                browserVersion: info.browserVersion,
                platform: info.platform,
                name: repoInfo.name,
                description: repoInfo.description,
                version: repoInfo.version
            }
        };

        runner.testResults = obj;

        console.log( "\u001b[35m Σ SUMMARY: %s testcases runned. \u001b[32m%s passed, \u001b[36m%s pending, \u001b[31m%s failed\u001b[0m", obj.stats.tests, obj.stats.passes, obj.stats.pending, obj.stats.failures ); //eslint-disable-line no-console

        let fileName = path.resolve( artifactsPath, reportName + ".json" );
        utils.createArtifactsFolder( browser );
        fs.writeFile( fileName, JSON.stringify( obj, null, "\t" ), err => {
            if ( err ) {
                throw err;
            } else {
                if ( options.reporterOptions.html !== false ) {
                    waitForPromises.push( report.generate( fileName ) );
                }
            }
        } );

    } );
}

