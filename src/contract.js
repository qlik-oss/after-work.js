/* eslint max-len:0, no-prototype-builtins:0, no-plusplus:0 */
/**
 * contract.js
 *
 * A simple framework for testing contracts between services
 *
 * @example - run all contract tests located in test/contracts/
 * node consumer-contract.js test/contracts
 *
 * @example - run a single contract test
 * node consumer-contract.js get-apps.json
 *
 * The contracts follow this format;
 *
 {
    "consumer": "Hub UI",
    "provider": "Hub Service",
    "request": {
        "method": "GET",
        "url": "http://localhost:9028/apps"
    },
    "response": {
        "statusCode": 200,
        "body": { ... }
    }
 }
 *
 * The contract tester tests both that the statusCode is as expected but it also does a
 * deep search for every property inside the contract and verifies that the same property
 * can be found in the response - regardless of it's actual value.
 */


 // eslint-disable-line strict

import request from 'request';
import globby from 'globby';
import path from 'path';

/**
 * Helper function reference for printing to stdout and also we only need to
 * disable eslint no-console once...
 */
const print = console.log.bind(console); // eslint-disable-line no-console

/**
 * Unicode enum for coloring the terminal foreground... Nice to have...
 *
 * @example
 * print( STATUS.success, "Everything looks good!" );
 */
const STATUS = {
  default: '\x1b[37m',
  success: '\x1b[32m',
  warn: '\x1b[33m',
  fail: '\x1b[31m',
};

const EXIT_CODES = {
  fail: -1,
  ok: 0,
};

/**
 * Validates if the JSON file has properties: consumer, provider, request, and, response.
 *
 * @param {String} filepath - the filepath to the JSON contract file
 * @returns {Boolean}         - true if the file is a valid contract
 */
function isContract(filepath) {
  let json;
  try {
    json = require(filepath); // eslint-disable-line
  } catch (error) {
    print(STATUS.warn, `${filepath} is not a valid JSON file -- skipping file`);
    return false;
  }

  const hasConsumerProperty = json.hasOwnProperty('consumer');
  const hasProviderProperty = json.hasOwnProperty('provider');
  const hasRequestProperty = json.hasOwnProperty('request');
  const hasResponseProperty = json.hasOwnProperty('request');

  if (!hasConsumerProperty) {
    print(STATUS.warn, `${filepath} Missing Property "consumer" -- not a valid contract`);
  } else if (!hasProviderProperty) {
    print(STATUS.warn, ` ${filepath} Missing Property "provider" -- not a valid contract`);
  } else if (!hasRequestProperty) {
    print(STATUS.warn, ` ${filepath} Missing Property "request" -- not a valid contract`);
  } else if (!hasResponseProperty) {
    print(STATUS.warn, `${filepath} Missing Property "response" -- not a valid contract`);
  }

  return hasProviderProperty && hasConsumerProperty && hasRequestProperty && hasResponseProperty;
}

/**
 * Given an array of filepaths we will validate each path if it's a valid contract, or
 * not and strip away all non-contracts, returning a list of only contracts.
 *
 * @param {Array} paths         - an array of filepaths pointing to contracts
 * @returns {Array} contracts     - an array of filepaths of verified contracts
 */
function validateContracts(paths) {
  if (paths.length === 0) {
    throw 'No contracts found'; // eslint-disable-line
  } else {
    for (let i = 0; i < paths.length; i++) {
      if (!isContract(`${paths[i]}`)) {
        paths.splice(i, 1);
      }
    }
    return paths.map(require);
  }
}

/**
 * Will go over each property and sub-property in `contract` and see if it also exists on the same level in `response`.
 * We do not care about the type of the properties, and we do not care if there are more properties in `response`, than
 * there are in `contract`.
 *
 * @param {Object} contract - the contract that we want our response to match
 * @param {Object} response - The object that represents the response body for whatever endpoint result
 *
 * @returns {Boolean} true if all properties and sub-properties from `contract` can be found in `response`
 */
function verifyContract(contract, response, result) {
  result = result || { id: '', status: '', text: [] };

  if (!contract) {
    return false;
  }

  const keys = Object.keys(contract);
  const len = keys.length;

  for (let i = 0; i < len; i++) {
    const key = keys[i];
    const prop = contract[key];

    if (!response.hasOwnProperty(key)) {
      result.status = 'fail';
      result.text.push(`${result.id} response is missing property "${key}"`);
      return false;
    }

    if (Object.prototype.toString.call(prop) === '[object Object]' && !verifyContract(prop, response[key], result)) {
      return false;
    } else if (Object.prototype.toString.call(prop) === '[object Array]') {
      const contractFirstProp = prop[0];
      const responseFirstProp = response[key][0];
      const contractFirstPropIsObj = Object.prototype.toString.call(contractFirstProp) === '[object Object]';

      if (contractFirstProp && contractFirstPropIsObj && !verifyContract(contractFirstProp, responseFirstProp, result)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Compares the expected statuscode from `contract` with the actual statuscode specified in `response`.
 * Compares the expected `contract` body with the actual response body.
 *
 * @param {Object} contract - the contract that we want our response to match
 * @param {Object} response - The object that represents the response body for whatever endpoint result
 */
function runContract(contract, response) {
  const result = {
    id: `${contract.request.url}`,
    status: '',
    text: [],
  };

  const equalStatusCode = contract.response.statusCode === response.statusCode;
  if (!equalStatusCode) {
    result.status = 'fail';
    result.text.push(`${result.id} Expected statuscode ${contract.response.statusCode}, Actual statuscode ${response.statusCode}`);
  }

  let responseBody = response.body;
  try {
    responseBody = JSON.parse(response.body);
  } catch (error) {
        // if request has failed body is a string not an object
    if (response.body !== contract.response.body) {
      result.status = 'fail';
      result.text.push(`Unable to parse response body ${error}`);
    }
  }

  if (equalStatusCode && verifyContract(contract.response.body, responseBody, result)) {
    result.status = 'success';
    result.text.push(`\u2713 PASSED: Contract ${result.id} passed all checks!`);
  }

  return result;
}

/**
 * Runs all contracts and verifies them according to @verifyContract( .. )
 *
 * @param {Object} contract - the contract that we want our response to match
 */
function runContracts(contracts) {
  const results = [];
  contracts.forEach((contract) => {
    results.push(new Promise((resolve, reject) => {
      request(contract.request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(runContract(contract, response));
        }
      });
    }));
  });
  return Promise.all(results);
}

/**
 * Takes an array of results and filters it so only failed entries remains, and
 * then maps it on the id so we can identify what call failed, and lastly it joins
 * each entry with a failed format so that we get a nicely formatted "failed"-string
 *
 * @param {Array} results - array of results
 *
 * @returns {String} - a "failed"-string
 */
function buildFailedString(results) {
  return `\u2717 FAILED:${results.filter(result => result.status === 'fail').map(object => object.id).join('\n \u2717 FAILED: ')}`;
}

/**
 * Sorts all results and prints the successful tests firsts, then prints
 * the failed tests and prints what it was that failed.
 *
 * @param {Array} results - array of results
 * @returns {String} String status code  [ 0 | -1 ] depending on the success
 */
function parseResults(results) {
    // sort the result so that potential errors are pushed last
  results = results.sort((a, b) => a === 'fail' ? -1 : b === 'fail' ? 0 : 1); // eslint-disable-line

    // assume everything went ok before we actually parse the result...
  let processExitCode = EXIT_CODES.ok;
  const hasFailed = results.filter(elem => elem.status === 'fail').length > 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    for (let message in result.text) { // eslint-disable-line 
      message = result.text[message];
      print(STATUS[result.status], message);
    }

    if (i === results.length - 1 && hasFailed) {
      print(STATUS.fail, buildFailedString(results));
      processExitCode = EXIT_CODES.fail;
    }
  }
  print(STATUS.default); // reset the coloring
  return processExitCode;
}

export default {
    /**
     * Main entry point for testing contracts
     */
  start(contractsPath) {
    return globby(path.resolve(contractsPath))
      .then(validateContracts)
      .then(runContracts)
      .then(parseResults)
      .catch((err) => {
        print(STATUS.default, err);
        return EXIT_CODES.fail;
      });
  },

    // Export this for cases when we already got the response and what to verify it
  verifyContract,
  runContract,
};
