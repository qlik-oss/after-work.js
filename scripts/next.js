#!/usr/bin/env node
const pkg = require('../package');
const moment = require('moment');
const { execSync } = require('child_process');

const nextVersion = `${pkg.version.split('-dev').shift()}-dev.${+moment().format('YYYYMMDD')}`;
execSync(`npm version ${nextVersion} --no-git-tag-version`);
