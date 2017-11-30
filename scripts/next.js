#!/usr/bin/env node
const pkg = require('../package');
const { execSync } = require('child_process');

const nextVersion = `${pkg.version.split('-dev').shift()}-dev.${+new Date()}`;
execSync(`npm version ${nextVersion} --no-git-tag-version`);
